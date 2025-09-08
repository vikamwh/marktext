## Test the kroki server

```
curl https://kroki.io/graphviz/svg --data-raw "digraph G {Hello->World}" > diagram.svg
```

alternativ mit localhost ohne Umleitung in file:

```
curl http://localhost:8000/graphviz/svg --data-raw "digraph G {Hello->World}"
```