# WSK

This is a simple simulation program without using any third-party libraries. Link at https://projektwsk.pages.dev/

## How to use it

To create a generation, choose your creature parameters in the settings box on the top right. By hovering over your input fields you can get a short explanation of what each input field does. **Game Rules**: the first checkbox makes it so when creatures die they transform into food (by popular request) and the nth-Frame drawn just makes it so not every calculated frame gets drawn since drawing takes some time for bigger creature counts in the tens of thousands and this setting does not affect any of the results. **Evolution Parameters** define how the next generation will look like: The relative generation size defines at what point in the simulation the simulation gets paused and a new generation gets created. E.g. with a starting creature count of 100 and a Rel. generation count of 0.9, as soon as only 90 creatures remain, a new generation gets created. Mutation rate is a parameter influencing the standard deviation $\sigma_m$. This is important when the new generation is created; The average $\mu$ and standard deviation $\sigma_p$ of the properties of all creatures gets calculated and then new creatures with randomized properties following the mean $\mu$ and standard deviation $\sigma = \sigma_m \cdot \sigma_p$ of a gaussian distribution. Every generation starts with the same amount of creatures. The amount of creatures can be defined in the Nr of Generations input field.

## Plots

There is a simple implentation built from scratch for a visualization of the data of the creatures (creature-time diagram) but since this is tedious to do there also exists a button to export the data for this diagram as .csv or JSON (**Export Plot Data**). The properties of each individual creature can also be exported but only as JSON as we did not know of any good way to do that in the format of .csv. The property **Plot Step Size** defines how many ticks pass between each point gets drawn on the screen on the website and does not affect exported data.

## How does it work?

There are classes for creatures, food and for convenience (and UI) sake, a notification class. These control the behaviour. If you want to edit how they work it's probably best to just look at the class and where their public functions get called since the majority of the code is just interactions with HTML, CSS and UI stuff.
