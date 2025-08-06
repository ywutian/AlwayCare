# AlwayCare
Kids Protection AI Companion

You are an expert full-stack developer building a child-safety web application. Create a complete web project with the following features:

- **Frontend:** A responsive homepage with a file upload form for images of children/environments. After an image is uploaded, display it on the page and show any detected dangers.
- **Image Analysis:** Integrate a computer vision model (e.g. a pretrained YOLOv8 model) that processes each uploaded image. The model should identify hazardous objects or situations (water, fire, weapons, roadways, etc.) and output labels and confidence scores. If the image contains risks (like a child near water or fire), the app should display a clear warning message (e.g. "Alert: Child near water - potential drowning risk").
- **Backend:** Set up a server (Node.js with Express, or Python with Flask) that handles the image upload API endpoint. Use middleware (like Multer in Express) to handle file uploads. After saving the image to the server, call the CV model to analyze it.
- **Database:** Implement a secure database to log all users and image analyses. Create a `Users` table/collection (fields: username, hashed password, email)16, and an `ImageRecords` table/collection (fields: image filename/path, upload timestamp, detected objects, user ID reference). When a user uploads an image, save the image info and analysis results to the DB.
- **User Data Security:** Do not store sensitive data on the client. Use server-side sessions or JWT tokens for authentication and fetch user profile data only when needed17.
- **Continuous Operation:** The server should run continuously. Set up a background job or loop so that any new uploads are processed automatically. For example, use `setInterval()` or a scheduled job (like node-schedule) to periodically invoke the image processing function1819.
- **UI/UX Theme:** Use a modern, friendly design theme. Choose a light color palette (soft blues and greens) that conveys trust and safety2021. Use a clean font and include an illustrative banner or icon related to family/children. For instance, the page might feature a happy child illustration or photo in a safe environment to set a positive tone.
- **Running:** The app should be ready to run with one command (e.g. `npm start`) and continue running. Include any necessary scripts (e.g. in `package.json`) so the backend and frontend start together.
- **Documentation:** Include comments or README instructions explaining how the CV model is integrated and how the continuous background processing works.

Build the site as a full-stack project (you can use React or HTML/CSS/JS for the frontend and Node or Python for the backend). The final output should be runnable code for a website that meets all these requirements without needing further user intervention.
