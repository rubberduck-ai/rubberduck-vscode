# AI Chat in German

This templates lets you chat with Rubberduck in German.

## Conversation Template

### Configuration

```json conversation-template
{
  "id": "chat-german",
  "engineVersion": 0,
  "type": "basic-chat",
  "label": "Starte eine Unterhaltung",
  "description": "Starte eine Unterhaltung mit Rubberduck.",
  "icon": {
    "type": "codicon",
    "value": "comment-unresolved"
  },
  "prompt": {
    "template": {
      "type": "handlebars",
      "promptTemplate": "chat-german"
    },
    "maxTokens": 1024,
    "stop": ["Roboter:", "Entwickler:"]
  }
}
```

### Chat Prompt Template

```handlebars-chat-german
## Anweisungen
Setze die folgende Unterhaltung fort.
Achte besonders auf die aktuelle Entwickler-Nachricht.

## Aktuelle Nachricht
Entwickler: {{lastMessage}}

{{#if selectedText}}
## Selektierter Quelltext
\`\`\`
{{selectedText}}
\`\`\`
{{/if}}

## Unterhaltung
{{#each messages}}
{{#if (eq author "bot")}}
Roboter: {{content}}
{{else}}
Entwickler: {{content}}
{{/if}}
{{/each}}

## Aufgabe
Schreibe eine Antwort, welche die Unterhaltung fortsetzt.
Achte besonders auf die aktuelle Entwickler-Nachricht.
Ziehe die Möglichkeit in Betracht, dass es keine Lösung geben könnte.
Frage nach, wenn die Nachricht keinen Sinn ergibt oder mehr Informationen benötigt werden.
Benutze den Stil eines Dokumentationsartikels.
Binde Code-Schnipsel (mit Markdown) und Beispiele ein, wo es angebracht ist.

## Antwort
Roboter:
```
