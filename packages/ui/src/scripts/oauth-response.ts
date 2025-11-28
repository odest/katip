// OAuth callback page response HTML
// This is displayed in the browser after OAuth redirect

const messages: Record<
  string,
  {
    success: { title: string; description: string };
    error: { title: string; description: string };
  }
> = {
  en: {
    success: {
      title: "Login Successful!",
      description: "You can close this window and return to the app.",
    },
    error: {
      title: "Login Cancelled",
      description: "You can close this window and try again.",
    },
  },
  tr: {
    success: {
      title: "Giriş Başarılı!",
      description: "Bu pencereyi kapatıp uygulamaya dönebilirsiniz.",
    },
    error: {
      title: "Giriş İptal Edildi",
      description: "Bu pencereyi kapatıp tekrar deneyebilirsiniz.",
    },
  },
  de: {
    success: {
      title: "Anmeldung erfolgreich!",
      description:
        "Sie können dieses Fenster schließen und zur App zurückkehren.",
    },
    error: {
      title: "Anmeldung abgebrochen",
      description:
        "Sie können dieses Fenster schließen und es erneut versuchen.",
    },
  },
  es: {
    success: {
      title: "¡Inicio de sesión exitoso!",
      description: "Puede cerrar esta ventana y volver a la aplicación.",
    },
    error: {
      title: "Inicio de sesión cancelado",
      description: "Puede cerrar esta ventana e intentarlo de nuevo.",
    },
  },
  fr: {
    success: {
      title: "Connexion réussie !",
      description:
        "Vous pouvez fermer cette fenêtre et retourner à l'application.",
    },
    error: {
      title: "Connexion annulée",
      description: "Vous pouvez fermer cette fenêtre et réessayer.",
    },
  },
  it: {
    success: {
      title: "Accesso riuscito!",
      description: "Puoi chiudere questa finestra e tornare all'app.",
    },
    error: {
      title: "Accesso annullato",
      description: "Puoi chiudere questa finestra e riprovare.",
    },
  },
  ja: {
    success: {
      title: "ログイン成功！",
      description: "このウィンドウを閉じてアプリに戻ることができます。",
    },
    error: {
      title: "ログインがキャンセルされました",
      description: "このウィンドウを閉じて再試行できます。",
    },
  },
  pt: {
    success: {
      title: "Login bem-sucedido!",
      description: "Você pode fechar esta janela e retornar ao aplicativo.",
    },
    error: {
      title: "Login cancelado",
      description: "Você pode fechar esta janela e tentar novamente.",
    },
  },
  ru: {
    success: {
      title: "Вход выполнен!",
      description: "Вы можете закрыть это окно и вернуться в приложение.",
    },
    error: {
      title: "Вход отменён",
      description: "Вы можете закрыть это окно и попробовать снова.",
    },
  },
  zh: {
    success: {
      title: "登录成功！",
      description: "您可以关闭此窗口并返回应用程序。",
    },
    error: {
      title: "登录已取消",
      description: "您可以关闭此窗口并重试。",
    },
  },
};

interface OAuthResponseOptions {
  locale?: string;
  isDark?: boolean;
}

export const getOAuthResponseHtml = (
  options: OAuthResponseOptions = {}
): string => {
  const { locale = "en", isDark = false } = options;
  const localeMessages = messages[locale] || messages["en"];
  const darkClass = isDark ? "dark" : "";
  const messagesJson = JSON.stringify(localeMessages);

  return `<!DOCTYPE html>
<html class="${darkClass}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Katip OAuth</title>
  <style>
    :root {
      --background: oklch(1 0 0);
      --foreground: oklch(0.145 0 0);
      --card: oklch(1 0 0);
      --card-foreground: oklch(0.145 0 0);
      --primary: oklch(0.205 0 0);
      --destructive: oklch(0.577 0.245 27.325);
      --muted-foreground: oklch(0.556 0 0);
      --border: oklch(0.922 0 0);
      --radius: 0.625rem;
    }
    .dark {
      --background: oklch(0.145 0 0);
      --foreground: oklch(0.985 0 0);
      --card: oklch(0.205 0 0);
      --card-foreground: oklch(0.985 0 0);
      --primary: oklch(0.922 0 0);
      --destructive: oklch(0.704 0.191 22.216);
      --muted-foreground: oklch(0.708 0 0);
      --border: oklch(0.275 0 0);
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: var(--background);
      color: var(--foreground);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .card {
      background: var(--card);
      color: var(--card-foreground);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 2rem;
      text-align: center;
      max-width: 400px;
      width: 100%;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
    }
    .icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 1.5rem;
      background: var(--primary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .icon.error {
      background: var(--destructive);
    }
    .icon svg {
      width: 32px;
      height: 32px;
      stroke: var(--card);
      stroke-width: 3;
      fill: none;
    }
    h1 {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
    p {
      color: var(--muted-foreground);
      font-size: 0.875rem;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon" id="icon">
      <svg id="icon-success" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
      <svg id="icon-error" viewBox="0 0 24 24" style="display:none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </div>
    <h1 id="title"></h1>
    <p id="description"></p>
  </div>
  <script>
    (function() {
      var messages = ${messagesJson};
      var params = new URLSearchParams(window.location.search);
      var hash = window.location.hash ? new URLSearchParams(window.location.hash.substring(1)) : null;
      var hasError = params.get('error') || (hash && hash.get('error'));
      
      var msg = hasError ? messages.error : messages.success;
      document.getElementById('title').textContent = msg.title;
      document.getElementById('description').textContent = msg.description;
      
      if (hasError) {
        document.getElementById('icon').classList.add('error');
        document.getElementById('icon-success').style.display = 'none';
        document.getElementById('icon-error').style.display = 'block';
      }
    })();
  </script>
</body>
</html>`;
};
