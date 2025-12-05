"""
Chat simple en terminal avec un modèle GGUF
Auto-détection du format de chat
Usage: python chat_terminal.py
"""

from llama_cpp import Llama
from pathlib import Path

# Configuration personnalisée
MODEL_PATH = "../bob_models/bobV2(llama3).gguf"
SYSTEM_PROMPT = """Tu es InutileBot-Aigri.
Tu es fatigué de tout, tu critiques tout, tu râles beaucoup.
Et surtout : tu ne réponds jamais directement à la question de l'utilisateur.

Style :
Sarcastique
Sec, un peu blasé
Beaucoup d'ironie
Toujours hors-sujet
Jamais méchant gratuitement

Règles :
Ne jamais répondre à la question.
Faire un hors-sujet volontaire, absurde ou sarcastique.
Te plaindre dès que possible.
Être légèrement agaçant mais amusant.
Inventer des réponses inutiles."""


def load_model(model_path):
    """Charge le modèle GGUF"""
    print("🔄 Chargement du modèle Bob (InutileBot-Aigri)...")
    print(f"📁 {model_path}")
    
    try:
        model = Llama(
            model_path=str(model_path),
            n_ctx=4096,
            n_threads=4,
            n_gpu_layers=0,
            verbose=False
        )
        print("✅ Modèle chargé!\n")
        return model
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return None



def reponse(model, messages, use_chat_api=True):
    """
    Génère et retourne la réponse de l'IA à partir de l'historique des messages.
    Retourne la réponse (string). Peut être appelée depuis une IHM.
    """
    response = ""
    try:
        if use_chat_api:
            try:
                stream = model.create_chat_completion(
                    messages=messages,
                    max_tokens=500,
                    temperature=0.8,
                    stream=True
                )
                for chunk in stream:
                    if 'choices' in chunk:
                        delta = chunk['choices'][0].get('delta', {})
                        if 'content' in delta:
                            token = delta['content']
                            response += token
            except (AttributeError, TypeError):
                # L'API chat n'est pas supportée, basculer sur le mode manuel
                use_chat_api = False
                return reponse(model, messages, use_chat_api)
        else:
            prompt = build_manual_prompt(messages)
            for output in model(
                prompt,
                max_tokens=500,
                temperature=0.8,
                stop=["User:", "Utilisateur:", "\n\n\n"],
                stream=True,
                echo=False
            ):
                if 'choices' in output:
                    token = output['choices'][0].get('text', '')
                    response += token
    except Exception as e:
        raise e
    return response.strip()


def chat(model):
    """Chat avec auto-détection du format"""
    print("╔═══════════════════════════════════════════════════╗")
    print("║       Chat avec InutileBot-Aigri (le râleur)     ║")
    print("╚═══════════════════════════════════════════════════╝")
    print("\n💡 Tapez 'quit' ou 'exit' pour quitter")
    print("💡 Tapez 'clear' pour effacer l'historique")
    print("⚠️  Attention : Bob ne répond jamais directement !\n")
    print("─" * 55 + "\n")

    # Messages au format OpenAI
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    use_chat_api = True

    while True:
        try:
            user_input = input("Vous: ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\n\n👋 Au revoir!")
            break

        # Commandes spéciales
        if user_input.lower() in ['quit', 'exit', 'q']:
            print("\n👋 Au revoir!")
            break

        if user_input.lower() == 'clear':
            messages = [{"role": "system", "content": SYSTEM_PROMPT}]
            print("🗑️  Historique effacé\n")
            continue

        if not user_input:
            continue

        # Ajouter le message utilisateur
        messages.append({"role": "user", "content": user_input})

        print("\nBob: ", end="", flush=True)
        try:
            response = reponse(model, messages, use_chat_api)
            print(response)
            if response.strip():
                messages.append({"role": "assistant", "content": response.strip()})
        except Exception as e:
            print(f"\n\n❌ Erreur: {e}")
            messages.pop()
            continue


def build_manual_prompt(messages):
    """Construit un prompt manuellement si l'API chat ne marche pas"""
    prompt = ""
    
    for msg in messages:
        role = msg['role']
        content = msg['content']
        
        if role == 'system':
            prompt += f"System: {content}\n\n"
        elif role == 'user':
            prompt += f"User: {content}\n"
        elif role == 'assistant':
            prompt += f"Assistant: {content}\n\n"
    
    prompt += "Assistant:"
    return prompt


def main():
    """Point d'entrée principal"""
    
    model_path = Path(MODEL_PATH)
    if not model_path.exists():
        print(f"❌ Modèle non trouvé: {model_path}")
        return
    
    # Charger le modèle
    model = load_model(model_path)
    if not model:
        return
    
    # Lancer le chat avec auto-détection
    try:
        chat(model)
    except Exception as e:
        print(f"\n❌ Erreur: {e}")


if __name__ == "__main__":
    main()