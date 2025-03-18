# Guide: Creating Reviews in MongoDB Compass

This guide will walk you through the process of manually creating review posts in MongoDB Compass for testing purposes.

## Prerequisites

1. MongoDB Compass installed on your computer
2. MongoDB server running (either locally or remotely)
3. Connection to your database established in MongoDB Compass

## Step 1: Connect to Your Database

1. Open MongoDB Compass
2. Connect to your database using the connection string (usually `mongodb://localhost:27017` for local development)
3. Navigate to your project database (e.g., `review-app`)

## Step 2: Create an Establishment (if needed)

Before creating a review, you need an establishment to review:

1. Click on the `establishments` collection
2. Click the "Add Data" button and select "Insert Document"
3. Enter the establishment data in JSON format:

```json
{
  "name": "The Rustic Fork",
  "description": "A cozy restaurant with rustic ambiance and delicious food.",
  "logo": "rusticfork.jpg",
  "address": "123 Main Street, Anytown",
  "rating": 0,
  "reviewCount": 0,
  "createdAt": new Date()
}
```

4. Click "Insert" to save the establishment
5. Note the `_id` value that MongoDB generates (you'll need this for the review)

## Step 3: Create a Review

1. Click on the `reviews` collection
2. Click the "Add Data" button and select "Insert Document"
3. Enter the review data in JSON format:

```json
{
  "title": "Amazing Experience!",
  "body": "The food was delicious and the service was excellent. I highly recommend the pasta dishes and the chocolate dessert.",
  "rating": 5,
  "helpful": 0,
  "unhelpful": 0,
  "photos": ["food1.jpg", "food2.jpg"],
  "user": ObjectId("user_id_here"),  // Replace with actual user ID
  "establishment": ObjectId("establishment_id_here"),  // Replace with actual establishment ID
  "createdAt": new Date()
}
```

4. Replace `"user_id_here"` with the actual ObjectId of the user who is creating the review
   - You can find this in the `users` collection
5. Replace `"establishment_id_here"` with the actual ObjectId of the establishment being reviewed
   - This is the ID you noted in Step 2
6. Click "Insert" to save the review

## Step 4: Add Photos (Optional)

If you want to include photos in your review:

1. Make sure the image files exist in the `uploads` folder of your project
2. Include the filenames in the `photos` array of the review document
3. The application will look for these files in the `uploads` directory when displaying the review

## Step 5: Update Establishment Rating (Optional)

After adding a review, you might want to update the establishment's rating:

1. Go back to the `establishments` collection
2. Find the establishment you reviewed
3. Update the `rating` field with the appropriate value
4. Increment the `reviewCount` field by 1

## Step 6: Verify in the Application

1. Start your application server
2. Log in as the user who created the review
3. Navigate to the user profile page
4. You should see the newly created review in the "Past Review(s)" section

## Important Notes

- The `ObjectId()` function is used to reference documents between collections
- Make sure all required fields are filled in to avoid application errors
- The `createdAt` field uses `new Date()` to set the current date and time
- Photos must exist in the `uploads` directory for them to display correctly

This guide is for development and testing purposes only. In a production environment, reviews should be created through the application's user interface.
