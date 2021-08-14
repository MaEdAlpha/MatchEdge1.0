/*
When a user logs in via auth0
    
    1. query sessionID collection for user with the same email address.
        - if a user is found to already be logged in, then log out the current user 
            - when logging out a current user, you need to clear that session.

    2.  create sessionID and session Object for user.
            -features of user session:
                - should be able to detect when a user is no longer active. Done via a method that queries users who TTL is > session_expiry_length. Any documents that return, clear that session.

    3. all api calls need to have 


*/