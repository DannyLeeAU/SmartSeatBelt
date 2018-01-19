You'll notice the zipped file called APIVersion4. This is the zipped folder you will upload and deploy onto AWS Elastic Beanstalk upon
creation of an AWS account. Once this is uploaded and deployed, run the simulator and then go to the URL of this API given at the
top. Once you get to the URL, you should be at the smart Seat/Belt system welcome screen. Add to that current URL the following:

currentURL/api/getSeats or currentURL/api/getRecentSeats.

These are two API calls used on the iOS application to retrieve seat information.