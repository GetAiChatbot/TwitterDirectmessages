const express = require('express');
const session = require('express-session');
const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const Twit = require('twit');

const app = express();
const port = 3000;

// Configure express-session
app.use(session({ secret: 'Test', resave: true, saveUninitialized: true }));

// Configure passport
app.use(passport.initialize());
app.use(passport.session());

// Twitter API configuration
const T = new Twit({
  consumer_key: 'Oloi0EFj5MF92bChBGtL1cJnl',
  consumer_secret: 'Dm2sirtmJxtqUr82SvHjX8dVT8BsAYnnE9tfRdPLVFiaP3jPJj',
  access_token: '1683806126767210497-LWxZnaguD9XdGGIwP5GXYGPKCa7a2p',
  access_token_secret: 'oGx9qWAabHdYtJD6VrvCA1aDK1gi4zqNiYJrdA0G5RjrP',
});

// Passport configuration for Twitter OAuth
passport.use(new TwitterStrategy({
    consumerKey: 'Oloi0EFj5MF92bChBGtL1cJnl',
    consumerSecret: 'Dm2sirtmJxtqUr82SvHjX8dVT8BsAYnnE9tfRdPLVFiaP3jPJj',
    callbackURL: 'http://localhost:3000/auth/twitter/callback',
  },
  (token, tokenSecret, profile, done) => {
    
    const user = {
      id: profile.id,
      username: profile.username,
      token: token,
      tokenSecret: tokenSecret,
    };
    
    return done(null, user);
  }));
  

passport.serializeUser((user, done) => {
    console.log(user)
  const serializedUser = {
    id: user.id,
    username: user.username,
    token: user.token, 
    tokenSecret: user.tokenSecret,
  };
  done(null, serializedUser);
});


passport.deserializeUser((obj, done) => {
  const deserializedUser = {
    id: obj.id,
    username: obj.username,
    token: obj.token,
    tokenSecret: obj.tokenSecret,
  };
  done(null, deserializedUser);
});


// // Route for initiating Twitter OAuth authentication
// app.get('/auth/twitter', passport.authenticate('twitter'));

// // Callback route after Twitter has authenticated the user
// app.get('/auth/twitter/callback',
//   passport.authenticate('twitter', { failureRedirect: '/' }),
//   (req, res) => {
//     res.redirect('/send-message');
//   });

// // Function to send a direct message
// async function sendDirectMessage(screenName, message) {
//     try {
//       // Lookup the user by screen name to get the numeric user ID
//       const { data: [user] } = await T.get('users/lookup', { screen_name: screenName });

//       if (!user) {
//         throw new Error(`User with screen name ${screenName} not found`);
//       }

//       const recipientId = user.id_str;

//       // Send the direct message
//       const response = await T.post('direct_messages/events/new', {
//         event: {
//           type: 'message_create',
//           message_create: {
//             target: { recipient_id: recipientId },
//             message_data: { text: message },
//           },
//         },
//       });

//       console.log(`Message sent to user with ID ${recipientId}`);
//       return response.data;
//     } catch (error) {
//       console.error(`Error sending message to user with screen name ${screenName}:`, error);
//       throw error;
//     }
//   }


// // Route to send a test message (accessible only after authentication)
// app.get('/send-message', isAuthenticated, async (req, res) => {
//   try {
//     const recipientScreenName = 'GulzarAneeq11'; 
//     const message = 'Hello, this is a test message!';
//     await sendDirectMessage(recipientScreenName, message);
//     res.send('Message sent successfully!');
//   } catch (error) {
//     res.status(500).send('Error sending message');
//   }
// });


// Route for initiating Twitter OAuth authentication
app.get('/auth/twitter', passport.authenticate('twitter'));

// Callback route after Twitter has authenticated the user
app.get('/auth/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/get-messages');
  });


// Route to retrieve direct messages for the authenticated user from 1st Feb 2024
app.get('/get-messages', isAuthenticated, async (req, res) => {
  try {
      // Use the authenticated user's access token and access token secret
      const userAccessToken = req.user.token;
      const userAccessTokenSecret = req.user.tokenSecret;

      // Create a new Twit instance with the authenticated user's credentials
      const userT = new Twit({
          consumer_key: 'Oloi0EFj5MF92bChBGtL1cJnl',
          consumer_secret: 'Dm2sirtmJxtqUr82SvHjX8dVT8BsAYnnE9tfRdPLVFiaP3jPJj',
          access_token: userAccessToken,
          access_token_secret: userAccessTokenSecret,
      });

      const directMessages = await userT.get('direct_messages/events/list');

      // Filter messages created after February 1, 2024
      const feb1Timestamp = new Date('2024-02-01').getTime();
      const filteredMessages = directMessages.data.events.filter((event) => {
          const createdTimestamp = parseInt(event.created_timestamp);
          return createdTimestamp >= feb1Timestamp;
      });

      // Log the direct messages
      console.log('Direct Messages from 1st Feb 2024:', filteredMessages);

      // Send the filtered direct messages as a response
      res.json(filteredMessages);
  } catch (error) {
      console.error('Error fetching direct messages:', error);
      res.status(500).send('Error fetching direct messages');
  }
});
 

// Function to check if the user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
