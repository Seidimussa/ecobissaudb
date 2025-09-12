# Funcionalidades da API - EcoBissau

## 🎓 CURSOS

### Rotas Públicas
- `GET /api/courses` - Listar todos os cursos disponíveis
- `GET /api/courses/:id` - Ver detalhes de um curso específico

### Rotas Protegidas (requer autenticação)
- `GET /api/courses/my/enrolled` - Ver cursos em que o usuário está inscrito
- `POST /api/courses/:id/enroll` - Inscrever-se em um curso
- `GET /api/courses/:id/payment-status` - Verificar status de pagamento

## 💳 PAGAMENTOS

### Rotas Protegidas
- `POST /api/payments/:contentId/initiate` - Iniciar pagamento para um curso
- `POST /api/payments/webhook/flutterwave` - Webhook para processar pagamentos

## 📢 DENÚNCIAS

### Rotas Públicas
- `GET /api/reports` - Listar denúncias públicas (exceto rejeitadas)
- `GET /api/reports/:id` - Ver detalhes de uma denúncia
- `POST /api/reports` - Criar nova denúncia (autenticação opcional)

### Rotas Protegidas
- `GET /api/reports/my/reports` - Ver minhas denúncias

## 📊 FUNCIONALIDADES IMPLEMENTADAS

### Para Usuários:
1. ✅ **Ver cursos disponíveis** - Listar todos os cursos com informações básicas
2. ✅ **Ver detalhes do curso** - Informações completas incluindo módulos e preço
3. ✅ **Inscrever-se em cursos** - Sistema de inscrição automática
4. ✅ **Fazer pagamentos** - Integração com Flutterwave para cursos pagos
5. ✅ **Ver meus cursos** - Lista de cursos inscritos com status e progresso
6. ✅ **Verificar pagamentos** - Status de pagamento de cada curso
7. ✅ **Fazer denúncias** - Sistema de denúncias com localização e imagens
8. ✅ **Ver minhas denúncias** - Histórico de denúncias do usuário

### Recursos Técnicos:
- 🔐 Autenticação JWT
- 📱 Upload de imagens para denúncias
- 🗺️ Geolocalização para denúncias
- 💰 Sistema de pagamentos integrado
- 📊 Controle de inscrições e progresso
- 🚫 Prevenção de inscrições duplicadas

## 🔧 MODELOS DE DADOS

### Course (Curso)
- Título multilíngue
- Descrição multilíngue
- Preço
- Nível (Iniciante/Intermediário/Avançado)
- Duração
- Módulos
- Thumbnail

### Enrollment (Inscrição)
- Usuário
- Curso
- Status (pending_payment/active/completed)
- Progresso (0-100%)
- Data de conclusão

### Payment (Pagamento)
- Usuário
- Inscrição
- Valor
- Moeda (XOF)
- Status (pending/completed/failed)
- Provedor (Flutterwave)

### Report (Denúncia)
- Título
- Tipo
- Descrição
- Localização (GeoJSON)
- Imagens
- Status (pending/resolved/rejected)
- Usuário (opcional - permite denúncias anônimas)