# Equipe automática de importação RotMG Wiki

Use esta divisão como se fossem trabalhadores do projeto.

## 1. Coletor RealmEye
Responsável por acessar páginas de categoria, descobrir sublinks e baixar sprites.

Comando base:

```bash
npm run import -- --url /wiki/daggers --batch 25
```

## 2. Normalizador de Dados
Responsável por limpar JSON:
- troca `Unknown` por `null` ou array vazio;
- mantém classes padrão por tipo de item;
- remove duplicação;
- salva sprite local em `/public/items`.

## 3. Auditor de Qualidade
Depois de cada lote, confira:
- sprites carregando;
- JSON válido;
- descrição não virou lista de drops;
- itemType correto;
- filtros funcionando.

## Ordem segura de importação
Comece pequeno, sempre em lotes de 25:

```bash
npm run import -- --url /wiki/daggers --batch 25
npm run import -- --url /wiki/swords --batch 25
npm run import -- --url /wiki/bows --batch 25
npm run import -- --url /wiki/staves --batch 25
npm run import -- --url /wiki/wands --batch 25
npm run import -- --url /wiki/katanas --batch 25
npm run import -- --url /wiki/spellblades --batch 25
npm run import -- --url /wiki/rings --batch 25
```

Para reiniciar uma categoria:

```bash
npm run import -- --url /wiki/daggers --reset --batch 25
```

Para importar tudo de uma categoria, só use depois que os lotes de teste estiverem perfeitos:

```bash
npm run import -- --url /wiki/daggers --all
```

## Importante
Não use `--all` em várias categorias de uma vez na conta grátis do Replit. Faça por partes para não bater limite.
