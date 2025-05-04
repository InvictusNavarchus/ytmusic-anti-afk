## Context

YouTube music occasionaly show a “are you still there” confirmation modal after a certain time and automatically pause the video. The message may be differ, but the purpose and overall layout is the same. Users have to click “Yes” button to resume the music and close the modal. 

## Task

Your task is to create a robust userscript to observe and listen for that modal to appear. And when it appears, simulate a .click() on the Yes button. Basically an anti-afk automatic bypass script.

## Extra Feature

After a bypass attempt, (attempts to automatically click ‘yes’), create a persistent toast notification that indicate whether the script failed or succeed, with a check or other button for confirmation whether the user has read it, and gracefully make it disappear after that. 

if the user hasn't read the notification when the next bypass happens, simply stack the toast. 

## Site Behavior

at first AFK notice, the container weren't there. But after 1 afk, it dynamically created. but once the user click yes, it become hidden (by css? it's greyed out in the browser 1inspector), not removed. So you might need to handle that inconsistent behavior too for the mutation observer. 

## Source Code

Below (the attached file) is the HTML of the entire modal container. As you can see, the Yes Button is located at `$('ytmusic-you-there-renderer yt-button-shape'). You can refine the selector if needed. 