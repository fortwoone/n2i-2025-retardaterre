import tkinter as tk
from tkinter import scrolledtext
from pathlib import Path
from Patrick import load_model, reponse, SYSTEM_PROMPT, MODEL_PATH

class ChatIHM:
    def __init__(self, root):
        self.root = root
        self.root.title("InutileBot-Aigri - Chat IHM")
        self.root.geometry("600x500")

        self.text_area = scrolledtext.ScrolledText(root, wrap=tk.WORD, state='disabled', font=("Consolas", 11))
        self.text_area.pack(padx=10, pady=10, fill=tk.BOTH, expand=True)

        self.entry = tk.Entry(root, font=("Consolas", 12))
        self.entry.pack(padx=10, pady=(0,10), fill=tk.X)
        self.entry.bind('<Return>', self.send_message)

        self.send_btn = tk.Button(root, text="Envoyer", command=self.send_message)
        self.send_btn.pack(pady=(0,10))

        self.clear_btn = tk.Button(root, text="Effacer historique", command=self.clear_history)
        self.clear_btn.pack(pady=(0,10))

        self.messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        self.model = None
        self.init_model()
        self.add_message("Bob", "Bienvenue ! Pose ta question (il ne répondra jamais directement)")

    def init_model(self):
        model_path = Path(MODEL_PATH)
        if not model_path.exists():
            self.add_message("System", f"❌ Modèle non trouvé: {model_path}")
            return
        self.model = load_model(model_path)
        if not self.model:
            self.add_message("System", "❌ Erreur de chargement du modèle.")

    def add_message(self, sender, message):
        self.text_area['state'] = 'normal'
        self.text_area.insert(tk.END, f"{sender}: {message}\n")
        self.text_area['state'] = 'disabled'
        self.text_area.see(tk.END)

    def send_message(self, event=None):
        user_input = self.entry.get().strip()
        if not user_input or not self.model:
            return
        self.add_message("Vous", user_input)
        self.messages.append({"role": "user", "content": user_input})
        self.entry.delete(0, tk.END)
        self.root.after(100, self.get_ai_response)

    def get_ai_response(self):
        try:
            response = reponse(self.model, self.messages)
            self.add_message("Bob", response)
            if response.strip():
                self.messages.append({"role": "assistant", "content": response.strip()})
        except Exception as e:
            self.add_message("System", f"❌ Erreur: {e}")
            if self.messages and self.messages[-1]["role"] == "user":
                self.messages.pop()

    def clear_history(self):
        self.messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        self.text_area['state'] = 'normal'
        self.text_area.delete(1.0, tk.END)
        self.text_area['state'] = 'disabled'
        self.add_message("Bob", "Historique effacé. Pose une nouvelle question !")

if __name__ == "__main__":
    root = tk.Tk()
    app = ChatIHM(root)
    root.mainloop()
