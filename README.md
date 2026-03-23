# 🏫 Classroom Manager

**Classroom Manager** es una plataforma premium diseñada para docentes y delegados universitarios, enfocada en la gestión ágil de alumnos, evaluaciones y puntos de participación en tiempo real.

![Preview](public/favicon.png)

## 🚀 Características Principales

- **Gestión de Aulas:** Creación y administración de espacios académicos con tokens de acceso únicos.
- **Roles Definidos:**
  - **Delegados:** Administradores del aula, encargados de la configuración y gestión de docentes.
  - **Docentes:** Supervisores del progreso académico y registro de participaciones.
- **Seguimiento en Tiempo Real:** Registro instantáneo de participaciones y evaluaciones con vinculación directa a los estudiantes.
- **Sistema de Puntos:** Conversión inteligente entre puntos de la plataforma y puntaje de evaluación real.
- **Interfaz Premium:** Diseño moderno basado en el lenguaje visual de *ScrollxUI*, con soporte nativo para modo oscuro y estética minimalista.

## 🛠️ Stack Tecnológico

- **Frontend:** [Next.js 15+](https://nextjs.org) (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Vanilla CSS con variables dinámicas
- **Backend/Base de Datos:** [Supabase](https://supabase.com) (Auth, PostgreSQL, RLS)
- **Iconografía:** Lucide React

## 📦 Instalación y Configuración

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/cesar-user/classroom-manager.git
   cd classroom-manager
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Variables de Entorno:**
   Crea un archivo `.env.local` en la raíz y añade tus credenciales de Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon_de_supabase
   ```

4. **Ejecutar en desarrollo:**
   ```bash
   npm run dev
   ```

## 🛡️ Seguridad

El proyecto utiliza **Row Level Security (RLS)** de Supabase para garantizar que:
- Los delegados solo gestionen sus aulas creadas.
- Los docentes solo accedan a las aulas donde han sido invitados.
- Las membresías sean seguras y privadas.

---

Desarrollado con ❤️ para mejorar la experiencia educativa.
© 2024 **Classroom Manager • QCODE**
