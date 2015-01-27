# API

In its current form, the public "api" has the following callback functions:

ratingValues = When a rating is complete, it sends the rating values back. Croovies uses this, to compare the user's rating, to the average rating, to determine if the user was very different from the average.

itemSaved = This is obviously to signal to the publisher that whatever item is being rated, the rating has saved to BC. This is important to note, because a single rating can be (but is not always) more than 1 action. A user could move a point on just one dimension, and then stop - completing the rating. Or they might rate all 5 dimensions. The challenge is trying to save when the user is done - and not before. But also before they possibly leave the page.

ratingStarted = Because a rating generally takes multiple actions, BC waits a few seconds to save the rating. This is called as soon as the rating begins though. Croovies uses this to show a "constant visual timer", that when it is complete, the rating will save - modifying the rating will reset the timer.

ratingStopped = This clears the previous item

---

The rest of the JS API, is just defining style attributes for the charts.

I've built this solely based on what croovies has needed, so I haven't put much more thought into it beyond that... I imagine as we build croovies out more, we'll run into many more cases
