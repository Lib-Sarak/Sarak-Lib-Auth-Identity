# Checklist de Validação: Especialista em Organização de Site

### Arquitetura e Rotas
- [ ] A estrutura de URLs é hierárquica e semântica?
- [ ] As URLs seguem obrigatoriamente a hierarquia de diretórios (aba/subaba/sub-subaba), sem o uso de hashes para navegação principal?
- [ ] Slugs seguem o padrão lowercase e uso de hifens?
- [ ] Existe uma pasta dedicada para Componentes Reutilizáveis?

### Modularidade
- [ ] Os componentes extraídos seguem o princípio da Responsabilidade Única (SRP)?
- [ ] Foram removidas duplicidades de código (DRY)?
- [ ] O código é legível e auto-documentado?

### Navegação (UX)
- [ ] Breadcrumbs estão presentes em páginas de nível profundo?
- [ ] O menu principal respeita o limite cognitivo (<= 9 itens)?
- [ ] Foram implementados componentes modulares para as seções repetitivas?
- [ ] O sistema de navegação (Abas vs. Páginas) foi validado pelo usuário?
- [ ] O HTML é semântico e utiliza ARIA landmarks corretamente?
- [ ] Todas as imagens possuem atributos `alt` válidos?
- [ ] O contraste de cores foi verificado (WCAG)?
- [ ] A estratégia de estado (Local vs. Context) foi definida e aplicada?
- [ ] Foram implementados Breadcrumbs em páginas profundas?
- [ ] Os resultados foram registrados para o `gsd-registro-sessao`?

---
**As correções realizadas foram registradas para o `gsd-registro-sessao`?**
- [ ] Sim
