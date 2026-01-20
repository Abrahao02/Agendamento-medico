# Guia de Responsividade - CSS Mobile-First

## Visão Geral

Este guia documenta os padrões e práticas de responsividade implementados no projeto, seguindo uma abordagem **mobile-first** profissional.

## Princípios Fundamentais

### 1. Mobile-First

- **CSS base** é escrito para dispositivos móveis (0px+)
- **Media queries** usam `min-width` para adicionar estilos em telas maiores
- **Nunca** use `max-width` para estilos base

### 2. Prevenção de Overflow

- **Sempre** use `max-width: 100%` em containers
- **Nunca** use larguras fixas > 400px sem `max-width`
- **Sempre** adicione `overflow-x: hidden` no `html` e `body`

### 3. Flexbox vs Grid

- **Flexbox**: Layout unidimensional (linha OU coluna)
- **Grid**: Layout bidimensional (linha E coluna)
- **Regra**: Use Flexbox para componentes, Grid para layouts

## Breakpoints Padrão

```css
/* Mobile: 0px - 639px (base, não precisa media query) */

/* Tablet Portrait: 640px+ */
@media (min-width: 640px) { }

/* Tablet Landscape: 768px+ */
@media (min-width: 768px) { }

/* Desktop: 1024px+ */
@media (min-width: 1024px) { }

/* Large Desktop: 1280px+ */
@media (min-width: 1280px) { }
```

## Variáveis CSS Responsivas

### Tipografia

Todas as variáveis de tipografia usam `clamp()` para escalar automaticamente:

```css
--text-base: clamp(0.875rem, 0.5vw + 0.75rem, 1rem); /* 14px - 16px */
--heading-1: clamp(1.75rem, 4vw + 1rem, 2.25rem);   /* 28px - 36px */
```

### Espaçamentos

Espaçamentos também usam `clamp()`:

```css
--spacing-md: clamp(0.75rem, 1.5vw, 1rem);  /* 12px - 16px */
--spacing-lg: clamp(1rem, 2vw, 1.5rem);     /* 16px - 24px */
```

## Padrões de Código

### Container Responsivo

```css
.container {
  width: 100%;
  max-width: var(--container-max-width);
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--spacing-md);
  padding-right: var(--spacing-md);
}
```

### Card Responsivo

```css
.card {
  width: 100%;
  max-width: 100%;
  padding: var(--spacing-lg);
  box-sizing: border-box;
}

@media (min-width: 768px) {
  .card {
    padding: var(--spacing-xl);
  }
}
```

### Grid Responsivo

```css
.grid {
  display: grid;
  grid-template-columns: 1fr; /* Mobile: 1 coluna */
  gap: var(--spacing-lg);
}

@media (min-width: 640px) {
  .grid {
    grid-template-columns: repeat(2, 1fr); /* Tablet: 2 colunas */
  }
}

@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, 1fr); /* Desktop: 3 colunas */
  }
}
```

### Grid com Auto-Fit

```css
.auto-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-lg);
}
```

### Flexbox Responsivo

```css
.flex-container {
  display: flex;
  flex-direction: column; /* Mobile: coluna */
  gap: var(--spacing-md);
}

@media (min-width: 768px) {
  .flex-container {
    flex-direction: row; /* Desktop: linha */
    gap: var(--spacing-lg);
  }
}
```

### Input Responsivo

```css
.input {
  width: 100%;
  max-width: 100%;
  min-width: 0; /* CRÍTICO: permite shrink em flex containers */
  box-sizing: border-box;
}
```

### Botão Responsivo

```css
.btn {
  width: auto;
  min-width: 120px; /* Largura mínima para legibilidade */
  max-width: 100%;
}

.btn-full-width {
  width: 100%;
  max-width: 100%;
}
```

## Checklist de Validação

Antes de fazer commit, verifique:

### Larguras
- [ ] Nenhum elemento com `width` fixo > 400px sem `max-width`
- [ ] Todos os containers têm `max-width: 100%`
- [ ] Elementos em flex têm `min-width: 0` quando necessário

### Overflow
- [ ] `html` e `body` têm `overflow-x: hidden`
- [ ] Tabelas têm wrapper com `overflow-x: auto`
- [ ] Textos longos têm `word-wrap: break-word`
- [ ] Imagens têm `max-width: 100%`

### Tipografia
- [ ] Fontes usam `clamp()` ou variáveis responsivas
- [ ] Tamanho mínimo de texto: 12px
- [ ] Line-height ajustado para mobile

### Espaçamentos
- [ ] Espaçamentos usam variáveis com `clamp()`
- [ ] Padding não causa overflow
- [ ] Gap em flex/grid responsivo

### Media Queries
- [ ] Mobile-first: `min-width` em vez de `max-width`
- [ ] Breakpoints consistentes
- [ ] Testado em: 320px, 375px, 414px, 768px, 1024px, 1280px

## Testes

### Testes Automatizados

Execute os testes E2E de responsividade:

```bash
npm run test:e2e -- src/__tests__/e2e/responsive.spec.js
```

### Testes Manuais

1. Abra Chrome DevTools
2. Ative Device Toolbar (Ctrl+Shift+M)
3. Teste em:
   - iPhone SE (375px)
   - iPhone 12/13 (390px)
   - iPhone 14 Pro Max (430px)
   - iPad (768px)
   - Desktop (1280px+)

### Verificações

- [ ] Nenhum scroll horizontal
- [ ] Elementos não estouram viewport
- [ ] Textos legíveis (mínimo 12px)
- [ ] Botões clicáveis (mínimo 44x44px em mobile)
- [ ] Formulários funcionais
- [ ] Modais responsivos

## Erros Comuns

### ❌ EVITAR

```css
/* Largura fixa */
.element {
  width: 500px;
}

/* Max-width sem mobile-first */
@media (max-width: 768px) {
  .element {
    width: 100%;
  }
}

/* Padding fixo */
.element {
  padding: 20px;
}

/* Font-size fixo */
.title {
  font-size: 32px;
}
```

### ✅ CORRETO

```css
/* Largura máxima */
.element {
  max-width: 500px;
  width: 100%;
}

/* Mobile-first */
.element {
  width: 100%;
}

@media (min-width: 768px) {
  .element {
    max-width: 500px;
  }
}

/* Padding responsivo */
.element {
  padding: var(--spacing-lg);
}

/* Font-size responsivo */
.title {
  font-size: clamp(1.5rem, 3vw + 1rem, 2rem);
}
```

## Estrutura de Arquivos

```
src/
├── styles/
│   ├── variables.css          # Variáveis CSS (cores, espaçamentos, etc)
│   ├── mixins.css              # Helpers e utilitários
│   ├── responsive-base.css     # Base responsiva global
│   ├── utilities.css           # Classes utilitárias
│   └── motion.css              # Animações
│
├── components/
│   └── common/
│       └── Button/
│           ├── Button.jsx
│           └── Button.css      # Estilos específicos do componente
│
└── pages/
    └── Login/
        ├── Login.jsx
        └── Login.css           # Estilos específicos da página
```

## Referências

- [MDN - Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [CSS-Tricks - A Complete Guide to Flexbox](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [CSS-Tricks - A Complete Guide to Grid](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Can I Use - clamp()](https://caniuse.com/css-math-functions)
