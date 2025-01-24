# ![logo](https://i.imgur.com/s0BaSi3.png)

Welcome to the backend repository for Openedu, a web application designed to facilitate creating free digital classbooks. The backend API communicates with the PostgreSQL database using the `pg` library, providing a reliable and efficient data management solution.

## Description

The backend handles various functionalities, including managing user data, authorizing users, and serving API requests that power the frontend application. If you intend to run this application on your own server, you must set up a `.env` file with the necessary environment variables as outlined below.

## Environment Variables

To configure the backend application, create a `.env` file in the project root with the following variables:

```plaintext
APP_PORT=        # Port number on which the app will run
DB_HOST=         # Host address for the PostgreSQL database
DB_NAME=         # Database name
DB_PASS=         # Database password
DB_PORT=         # Database port
SMTP_HOST=       # SMTP host for sending emails
SMTP_PORT=       # SMTP port
SMTP_USER=       # SMTP user for email sending
SMTP_PASS=       # SMTP password for email sending
CORS_URL=        # Allowed CORS origins
SSL_PRIVKEY=     # Path to SSL private key
SSL_CERT=        # Path to SSL certificate
SSL_CERTBUNDLE=  # Path to SSL certificate bundle
```

## Key Technologies

- **CORS**: Used to manage cross-origin requests, allowing the frontend and backend to communicate seamlessly when hosted on different domains.
  
- **SMTP**: Utilized for sending emails to students and teachers, providing them with login credentials. The emails are securely sent using SMTP credentials.
  
- **SSL**: Ensures secure data transmission over the network, safeguarding communication between clients and the server with encryption.

## Endpoints

All endpoints are protected by Firebase authentication to ensure secure data handling and prevent unauthorized access. Each request is authenticated and authorized against Firebase to verify the sender's identity.

- **GET /userInfo**: Returns data to the frontend to decide which dashboard to display to the user, including necessary user information obtained from the PostgreSQL database.

- **POST /newSchool**: Handles the creation of users and essential data for a new school once the Admin completes the setup form.

- **POST /addGrade**: Adds a grade for a specific student in a specific subject.

- **POST /addAbsence**: Records an absence for a specific student in a specific subject.

- **POST /excuse**: Excuses a recorded absence for a specific student in a specific subject.

- **POST /excusePeriod**: Excuses all recorded absences for a user over a specified period, authorized by the Head Teacher.

## Required Configuration

For proper backend operation, include a Firebase service account file named `serviceacc.json` in the project root. This configuration is crucial to authenticate users and authorize requests through Firebase.
## Additional Information

- The backend primarily communicates with the PostgreSQL database using the `pg` library, ensuring efficient data operations.
- Please ensure the environment variables are set correctly before running the application, as they control critical aspects of its functionality and security.

Contributions to improve the backend functionality are welcome under the MIT License.
