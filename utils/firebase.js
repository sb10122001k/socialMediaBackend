  const { initializeApp } = require('firebase/app');
  const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');

  const firebaseConfig = {
      apiKey: "AIzaSyDwpLw3Oy044zsck8fBRpjfmaWA9C4tC8Y",
      authDomain: "socialmediaapp-62dd7.firebaseapp.com",
      projectId: "socialmediaapp-62dd7",
      storageBucket: "socialmediaapp-62dd7.appspot.com",
      messagingSenderId: "217981901436",
      appId: "1:217981901436:web:b25540103efe32360a47f9",
      measurementId: "G-GXM8FBRYFG"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const storage = getStorage(app);

  const uploadImage = async (file) => {
      const storageRef = ref(storage);
      const fileName = `${Date.now()}_${file.originalname}`;
      const imageRef = ref(storageRef, fileName);

      try {
          await uploadBytes(imageRef, file.buffer);
          const downloadURL = await getDownloadURL(imageRef);
          console.log('Image uploaded successfully. Download URL:', downloadURL);
          return downloadURL;
      } catch (error) {
          console.error('Error uploading image:', error);
          throw error;
      }
  };

  module.exports = uploadImage;
