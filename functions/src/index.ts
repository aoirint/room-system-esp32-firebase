import * as functions from 'firebase-functions';
import fetch from 'node-fetch';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//

export const doorStateChanged = functions.database.ref('/sensor/door').onWrite((change, context) => {
  if (!change.before.exists() || !change.after.exists()) return null;

    const prevDoorIsOpen = change.before.child('isOpen').val();
    const doorIsOpen = change.after.child('isOpen').val();

    const sendMessageToTeams = (title: string, text: string) => {
      const requestData = JSON.stringify({
        'title': title,
        'text': text,
      });

      return fetch(functions.config().teams.incoming_webhook_url, {
        method: 'POST',
        body: requestData,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    };

    if (!prevDoorIsOpen && doorIsOpen) {
      functions.logger.info("Door opened.", {structuredData: true});
      return sendMessageToTeams('DoorState Notification', 'Door opened.').then((response) => {
        functions.logger.info(`Door opening notified; Status: ${response.status}`, {structuredData: true});
        functions.logger.info(response, {structuredData: true});
      });
    }

    if (prevDoorIsOpen && !doorIsOpen) {
      functions.logger.info("Door closed.", {structuredData: true});
      return sendMessageToTeams('DoorState Notification', 'Door closed.').then((response) => {
        functions.logger.info(`Door closing notified; Status: ${response.status}`, {structuredData: true});
        functions.logger.info(response, {structuredData: true});
      });
    }

    return null;
});

// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
