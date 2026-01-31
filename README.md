# ProyectoPPWMerchanM

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.9.

## Project Structure

This project consists of two separate projects:

### Frontend (Angular)
- **Location**: Current directory
- **Technology**: Angular 17+ with standalone components
- **Authentication**: Firebase Auth
- **Build**: `npm run build`
- **Development server**: `npm start` (runs on http://localhost:4200)

### Backend (Jakarta EE)
- **Location**: Separate external project/directory
- **Technology**: Jakarta EE with JAX-RS, CDI, JPA
- **Database**: PostgreSQL
- **Server**: WildFly
- **API Base URL**: `http://localhost:8080/gproyectoFinal/api`
- **Status**: ✅ Running and connected via HttpClient

## Backend API Endpoints

The backend provides the following REST endpoints:

- `/user` - User management (CRUD operations)
- `/user/programadores` - Programmer-specific operations
- `/portafolio` - Portfolio/project management
- `/notification` - Notification system
- `/horario` - Schedule management
- `/asesoria` - Advisory services
- `/auth/validate` - Firebase token validation

## Backend Services

The backend provides the following REST endpoints:

- `/user` - User management (CRUD operations)
- `/user/programadores` - Programmer-specific operations
- `/portafolio` - Portfolio/project management
- `/notification` - Notification system
- `/horario` - Schedule management
- `/asesoria` - Advisory services
- `/auth/validate` - Firebase token validation

## Development server

To start a local development server, run:

```bash
npm start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
"# Proyecto-PPW" 
