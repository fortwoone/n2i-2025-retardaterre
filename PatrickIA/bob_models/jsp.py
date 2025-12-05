"""
Script pour extraire et copier un modèle Ollama en GGUF
Usage: python extract_ollama_model.py nom-du-modele
"""

import sys
import json
import shutil
import platform
from pathlib import Path

def get_ollama_dir():
    """Retourne le répertoire Ollama selon l'OS"""
    system = platform.system().lower()
    
    if system == "windows":
        base = Path.home() / ".ollama"
    elif system == "darwin":  # macOS
        base = Path.home() / ".ollama"
    else:  # Linux
        base = Path.home() / ".ollama"
    
    return base

def find_model_manifest(model_name):
    """Trouve le manifeste du modèle"""
    ollama_dir = get_ollama_dir()
    manifests_dir = ollama_dir / "models" / "manifests" / "registry.ollama.ai" / "library"
    
    # Chercher le modèle
    model_parts = model_name.split(":")
    model_base = model_parts[0]
    model_tag = model_parts[1] if len(model_parts) > 1 else "latest"
    
    manifest_path = manifests_dir / model_base / model_tag
    
    if not manifest_path.exists():
        print(f"❌ Modèle '{model_name}' non trouvé")
        print(f"   Chemin recherché: {manifest_path}")
        return None
    
    return manifest_path

def extract_model_blob(manifest_path, output_path):
    """Extrait le blob du modèle depuis le manifeste"""
    
    try:
        with open(manifest_path, 'r') as f:
            manifest = json.load(f)
        
        # Le manifeste contient des layers
        # On cherche le plus gros (c'est le modèle GGUF)
        layers = manifest.get('layers', [])
        
        if not layers:
            print("❌ Aucun layer trouvé dans le manifeste")
            return False
        
        # Trouver le layer le plus gros (le modèle)
        model_layer = max(layers, key=lambda x: x.get('size', 0))
        
        digest = model_layer.get('digest', '')
        if not digest:
            print("❌ Digest non trouvé")
            return False
        
        # Le digest est au format "sha256:xxxxx"
        blob_hash = digest.split(':')[1] if ':' in digest else digest
        
        # Chemin du blob
        ollama_dir = get_ollama_dir()
        blob_path = ollama_dir / "models" / "blobs" / f"sha256-{blob_hash}"
        
        if not blob_path.exists():
            # Essayer sans le préfixe sha256-
            blob_path = ollama_dir / "models" / "blobs" / blob_hash
        
        if not blob_path.exists():
            print(f"❌ Blob non trouvé: {blob_path}")
            return False
        
        # Copier le blob
        print(f"📦 Taille du modèle: {blob_path.stat().st_size / 1024 / 1024 / 1024:.2f} GB")
        print(f"📋 Copie de {blob_path.name}...")
        
        shutil.copy2(blob_path, output_path)
        
        print(f"✅ Modèle extrait vers: {output_path}")
        return True
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def list_available_models():
    """Liste tous les modèles Ollama disponibles"""
    ollama_dir = get_ollama_dir()
    manifests_dir = ollama_dir / "models" / "manifests" / "registry.ollama.ai" / "library"
    
    if not manifests_dir.exists():
        print("❌ Aucun modèle Ollama trouvé")
        return []
    
    models = []
    for model_dir in manifests_dir.iterdir():
        if model_dir.is_dir():
            for tag_file in model_dir.iterdir():
                if tag_file.is_file():
                    models.append(f"{model_dir.name}:{tag_file.name}")
    
    return models

def main():
    print("╔═══════════════════════════════════════════════════╗")
    print("║   Extracteur de modèles Ollama → GGUF            ║")
    print("╚═══════════════════════════════════════════════════╝\n")
    
    # Vérifier que Ollama est installé
    ollama_dir = get_ollama_dir()
    if not ollama_dir.exists():
        print("❌ Ollama n'est pas installé ou le répertoire n'existe pas")
        print(f"   Recherché: {ollama_dir}")
        return
    
    print(f"📁 Répertoire Ollama: {ollama_dir}\n")
    
    # Lister les modèles disponibles
    print("🔍 Modèles disponibles:")
    models = list_available_models()
    
    if not models:
        print("   Aucun modèle trouvé")
        print("\n💡 Téléchargez un modèle avec: ollama pull llama2")
        return
    
    for i, model in enumerate(models, 1):
        print(f"   {i}. {model}")
    
    # Demander quel modèle extraire
    if len(sys.argv) > 1:
        model_name = sys.argv[1]
    else:
        print("\n📝 Entrez le nom du modèle à extraire (ex: llama2:latest)")
        print("   Ou entrez le numéro: ", end="")
        choice = input().strip()
        
        if choice.isdigit():
            idx = int(choice) - 1
            if 0 <= idx < len(models):
                model_name = models[idx]
            else:
                print("❌ Numéro invalide")
                return
        else:
            model_name = choice
    
    print(f"\n🎯 Extraction de: {model_name}")
    
    # Trouver le manifeste
    manifest_path = find_model_manifest(model_name)
    if not manifest_path:
        print("\n💡 Assurez-vous que le modèle est téléchargé:")
        print(f"   ollama pull {model_name}")
        return
    
    print(f"✅ Manifeste trouvé: {manifest_path}")
    
    # Créer le dossier de sortie
    output_dir = Path("models")
    output_dir.mkdir(exist_ok=True)
    
    output_file = output_dir / "model.gguf"
    
    # Extraire le modèle
    if extract_model_blob(manifest_path, output_file):
        print(f"\n{'='*55}")
        print("✅ EXTRACTION RÉUSSIE!")
        print(f"{'='*55}")
        print(f"📂 Fichier: {output_file.absolute()}")
        print(f"📊 Taille: {output_file.stat().st_size / 1024 / 1024 / 1024:.2f} GB")
        print("\n💡 Vous pouvez maintenant utiliser ce fichier dans votre app!")
        print(f"{'='*55}")
    else:
        print("\n❌ Échec de l'extraction")

if __name__ == "__main__":
    main()