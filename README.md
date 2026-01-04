# Projeto: Sistema de Agendamento Médico

![Projeto Dashboard](https://via.placeholder.com/600x200.png?text=Dashboard+Médico)

## Descrição

Este projeto é um **sistema completo de agendamento para consultórios médicos**, desenvolvido com **React**, **Firebase** e integração opcional com **WhatsApp**.  

O sistema permite:

- Médicos criarem sua disponibilidade de horários.
- Pacientes agendarem consultas em horários livres.
- Visualização da agenda do dia e de todos os agendamentos.
- Alteração de status das consultas (`Pendente`, `Confirmado`, `Não Compareceu`).
- Notificações automáticas via WhatsApp ou e-mail para novos agendamentos.
- Dashboard com indicadores: consultas do mês, horários abertos e confirmados.
- Filtro de agendamentos por status.
- Visualização em **lista** e em **calendário** com destaque dos dias com horários definidos.

---

## Tecnologias Utilizadas

- **Frontend:** React, React Router Dom, CSS
- **Autenticação e Banco de Dados:** Firebase Authentication e Firestore
- **Hooks Firebase:** react-firebase-hooks
- **Integração WhatsApp:** envio de mensagens via link para número do paciente
- **Gerenciamento de estado:** useState, useEffect


