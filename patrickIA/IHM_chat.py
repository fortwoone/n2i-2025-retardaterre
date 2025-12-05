# === Imports PyQt et IA ===
from PyQt6 import QtWidgets, QtGui, QtCore
import sys
import re
from pathlib import Path
from llama_cpp import Llama
from prompt import SYSTEM_PROMPTS

def get_system_prompt(name):
    return SYSTEM_PROMPTS.get(name, SYSTEM_PROMPTS["Aigri"])

MODEL_PATH = "./patrick_model/patrickV2(llama3).gguf"

def load_model(model_path):
    try:
        model = Llama(
            model_path=str(model_path),
            n_ctx=8192,
            verbose=False
        )
        return model
    except Exception:
        return None

def build_manual_prompt(messages):
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

def reponse(model, messages, use_chat_api=True, system_prompt_name="Aigri"):
    system_prompt = get_system_prompt(system_prompt_name)
    messages = [m if m["role"] != "system" else {"role": "system", "content": system_prompt} for m in messages]
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
                use_chat_api = False
                return reponse(model, messages, use_chat_api, system_prompt_name)
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
        return f"[Erreur IA: {e}]"
    return response.strip()


def get_avatar_for_personality(personality_name):
    """
    Retourne l'avatar correspondant à la personnalité sélectionnée
    """
    avatars = {
        "Aigri": "./img/patrick-grou.png",
        "Fatigué": "./img/patrick-zzz.png",     
    }
    return avatars.get(personality_name, "./img/patrick-default.png")


class ChatBubble(QtWidgets.QFrame):
    def __init__(self, text, is_user=False, avatar_path=None, loading=False):
        super().__init__()
        self.setFrameShape(QtWidgets.QFrame.Shape.NoFrame)
        self.setSizePolicy(QtWidgets.QSizePolicy.Policy.Expanding, QtWidgets.QSizePolicy.Policy.Minimum)
        
        # Layout principal avec marges généreuses
        main_layout = QtWidgets.QHBoxLayout()
        main_layout.setContentsMargins(20, 12, 20, 12)
        main_layout.setSpacing(12)

        # Container pour la bulle avec layout vertical (pour gérer l'alignement)
        bubble_container = QtWidgets.QWidget()
        bubble_container.setSizePolicy(QtWidgets.QSizePolicy.Policy.Expanding, QtWidgets.QSizePolicy.Policy.Minimum)
        bubble_layout = QtWidgets.QHBoxLayout()
        bubble_layout.setContentsMargins(0, 0, 0, 0)
        bubble_layout.setSpacing(12)

        # Avatar (IA uniquement)
        if not is_user and avatar_path:
            avatar_label = QtWidgets.QLabel()
            # Vérifier si le fichier existe, sinon utiliser l'avatar par défaut
            if Path(avatar_path).exists():
                avatar_pix = QtGui.QPixmap(avatar_path)
            else:
                avatar_pix = QtGui.QPixmap("./img/patrick-default.png")
            
            avatar_pix = avatar_pix.scaled(
                48, 48,
                QtCore.Qt.AspectRatioMode.KeepAspectRatio,
                QtCore.Qt.TransformationMode.SmoothTransformation
            )
            avatar_label.setPixmap(avatar_pix)
            avatar_label.setFixedSize(48, 48)
            avatar_label.setStyleSheet("border-radius: 24px;")
            bubble_layout.addWidget(avatar_label, alignment=QtCore.Qt.AlignmentFlag.AlignTop)

        # Bulle de texte
        bubble = QtWidgets.QLabel(text)
        bubble.setWordWrap(True)
        bubble.setTextInteractionFlags(QtCore.Qt.TextInteractionFlag.TextSelectableByMouse)
        
        # CORRECTION IMPORTANTE : Ajuster la politique de taille
        bubble.setSizePolicy(QtWidgets.QSizePolicy.Policy.MinimumExpanding, QtWidgets.QSizePolicy.Policy.Minimum)
        bubble.setMinimumWidth(200)
        bubble.setMaximumWidth(850)  # Beaucoup plus large pour un meilleur confort
        
        # Styles améliorés avec plus d'espace
        if is_user:
            bubble.setStyleSheet("""
                QLabel {
                    background-color: #0084ff;
                    color: white;
                    padding: 18px 24px;
                    border-radius: 20px;
                    font-size: 15px;
                    line-height: 1.6;
                }
            """)
        elif loading:
            bubble.setStyleSheet("""
                QLabel {
                    background-color: #f0f0f0;
                    color: #666;
                    padding: 18px 24px;
                    border-radius: 20px;
                    font-style: italic;
                    font-size: 15px;
                    line-height: 1.6;
                }
            """)
        else:
            bubble.setStyleSheet("""
                QLabel {
                    background-color: #f0f0f0;
                    color: #1c1c1c;
                    padding: 18px 24px;
                    border-radius: 20px;
                    font-size: 15px;
                    line-height: 1.6;
                }
            """)

        # Placement des bulles
        if is_user:
            bubble_layout.addStretch()
            bubble_layout.addWidget(bubble, alignment=QtCore.Qt.AlignmentFlag.AlignTop)
        else:
            bubble_layout.addWidget(bubble, alignment=QtCore.Qt.AlignmentFlag.AlignTop)
            bubble_layout.addStretch()

        bubble_container.setLayout(bubble_layout)
        main_layout.addWidget(bubble_container)
        self.setLayout(main_layout)


from threading import Thread

class IAApp(QtWidgets.QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Patrick IA ChatBot")
        self.resize(900, 700)

        # Fond blanc classique
        self.setStyleSheet("""
            QWidget {
                background-color: white;
                color: #1c1c1c;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            }
        """)

        main_layout = QtWidgets.QVBoxLayout()
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)

        # --- En-tête ---
        header = QtWidgets.QFrame()
        header.setStyleSheet("""
            QFrame {
                background-color: #f8f9fa;
                border-bottom: 1px solid #e0e0e0;
                padding: 16px 24px;
            }
        """)
        header_layout = QtWidgets.QHBoxLayout()
        header_layout.setContentsMargins(24, 16, 24, 16)
        
        title_label = QtWidgets.QLabel("💬 Patrick IA ChatBot")
        title_label.setStyleSheet("""
            font-size: 20px;
            font-weight: 600;
            color: #1c1c1c;
        """)
        header_layout.addWidget(title_label)
        header_layout.addStretch()
        
        # Sélecteur de personnalité dans l'en-tête
        prompt_label = QtWidgets.QLabel("Personnalité:")
        prompt_label.setStyleSheet("font-size: 14px; color: #666; margin-right: 8px;")
        self.prompt_combo = QtWidgets.QComboBox()
        self.prompt_combo.addItems(list(SYSTEM_PROMPTS.keys()))
        self.prompt_combo.setStyleSheet("""
            QComboBox {
                background-color: white;
                border: 1px solid #d0d0d0;
                border-radius: 8px;
                padding: 8px 12px;
                font-size: 14px;
                min-width: 150px;
            }
            QComboBox:hover {
                border: 1px solid #0084ff;
            }
            QComboBox::drop-down {
                border: none;
                padding-right: 8px;
            }
        """)
        header_layout.addWidget(prompt_label)
        header_layout.addWidget(self.prompt_combo)
        header.setLayout(header_layout)
        main_layout.addWidget(header)

        # --- Zone scrollable ---
        self.scroll_area = QtWidgets.QScrollArea()
        self.scroll_area.setWidgetResizable(True)
        self.scroll_area.setStyleSheet("""
            QScrollArea {
                border: none;
                background-color: white;
            }
            QScrollBar:vertical {
                background-color: #f8f9fa;
                width: 10px;
                border-radius: 5px;
            }
            QScrollBar::handle:vertical {
                background-color: #c0c0c0;
                border-radius: 5px;
                min-height: 30px;
            }
            QScrollBar::handle:vertical:hover {
                background-color: #a0a0a0;
            }
        """)
        
        self.scroll_content = QtWidgets.QWidget()
        self.scroll_content.setStyleSheet("background-color: white;")
        self.scroll_layout = QtWidgets.QVBoxLayout()
        self.scroll_layout.setContentsMargins(0, 20, 0, 20)
        self.scroll_layout.setSpacing(4)  # Réduit pour un meilleur espacement
        self.scroll_layout.addStretch()
        self.scroll_content.setLayout(self.scroll_layout)
        self.scroll_area.setWidget(self.scroll_content)
        main_layout.addWidget(self.scroll_area)

        # --- Zone de saisie ---
        input_container = QtWidgets.QFrame()
        input_container.setStyleSheet("""
            QFrame {
                background-color: #f8f9fa;
                border-top: 1px solid #e0e0e0;
                padding: 16px 24px;
            }
        """)
        bottom_layout = QtWidgets.QHBoxLayout()
        bottom_layout.setContentsMargins(24, 16, 24, 16)
        bottom_layout.setSpacing(12)

        self.input_box = QtWidgets.QLineEdit()
        self.input_box.setPlaceholderText("Écrivez votre message...")
        self.input_box.setStyleSheet("""
            QLineEdit {
                background-color: white;
                color: #1c1c1c;
                border: 1px solid #d0d0d0;
                border-radius: 24px;
                padding: 12px 20px;
                font-size: 14px;
            }
            QLineEdit:focus {
                border: 2px solid #0084ff;
                padding: 11px 19px;
            }
        """)
        self.input_box.returnPressed.connect(self.on_submit)
        bottom_layout.addWidget(self.input_box)

        self.send_button = QtWidgets.QPushButton("Envoyer")
        self.send_button.setStyleSheet("""
            QPushButton {
                background-color: #0084ff;
                color: white;
                border: none;
                border-radius: 20px;
                padding: 12px 28px;
                font-size: 14px;
                font-weight: 600;
            }
            QPushButton:hover {
                background-color: #0073e6;
            }
            QPushButton:pressed {
                background-color: #0062cc;
            }
        """)
        self.send_button.clicked.connect(self.on_submit)
        bottom_layout.addWidget(self.send_button)

        input_container.setLayout(bottom_layout)
        main_layout.addWidget(input_container)

        self.setLayout(main_layout)

        # --- Historique et modèle ---
        self.messages = [{"role": "system", "content": get_system_prompt("Aigri")}]
        self.model = load_model(MODEL_PATH)

        self.loading_bubble = None

    def add_message(self, text, is_user=False, avatar_path="patrick-default.png", loading=False):
        bubble = ChatBubble(text, is_user, avatar_path if not is_user else None, loading=loading)
        self.scroll_layout.insertWidget(self.scroll_layout.count() - 1, bubble)
        QtCore.QTimer.singleShot(
            100,
            lambda: self.scroll_area.verticalScrollBar().setValue(
                self.scroll_area.verticalScrollBar().maximum()
            )
        )
        return bubble

    def on_submit(self):
        prompt = self.input_box.text().strip()
        if not prompt or not self.model:
            return

        # Message utilisateur
        self.add_message(prompt, is_user=True)
        self.messages.append({"role": "user", "content": prompt})
        self.input_box.clear()

        # Choix du prompt système
        system_prompt_name = self.prompt_combo.currentText()

        # Afficher une bulle de chargement
        self.loading_bubble = self.add_message("⏳ L'IA réfléchit...", is_user=False, loading=True)

        # Lancer la génération IA dans un thread
        def ia_task():
            response = reponse(self.model, self.messages, system_prompt_name=system_prompt_name)
            QtCore.QMetaObject.invokeMethod(self, "show_ia_response", QtCore.Qt.ConnectionType.QueuedConnection, QtCore.Q_ARG(str, response))

        Thread(target=ia_task, daemon=True).start()

    @QtCore.pyqtSlot(str)
    def show_ia_response(self, response):
        # Supprimer la bulle de chargement
        if self.loading_bubble:
            self.loading_bubble.setParent(None)
            self.loading_bubble = None
        
        # Récupérer l'avatar en fonction de la personnalité sélectionnée
        current_personality = self.prompt_combo.currentText()
        avatar_path = get_avatar_for_personality(current_personality)
        
        self.add_message(response, is_user=False, avatar_path=avatar_path)
        if response.strip():
            self.messages.append({"role": "assistant", "content": response.strip()})


app = QtWidgets.QApplication(sys.argv)
window = IAApp()
window.show()
sys.exit(app.exec())