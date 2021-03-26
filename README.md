# The Picture of Health
## An Interactive Dashboard 

![Webpage Screenshot](https://github.com/mfineman/Picture_of_Health/blob/main/Code/static/Images/healthWealth.jpg)

### Overview

This project involved building a dashboard that enables uers to explore the relationships between poverty and various factors known to affect overall health: education level, availability of good food, and safety from violent crime. 

![Leaflet map](https://github.com/mfineman/Picture_of_Health/blob/main/Code/static/Images/map.png)

Data is derived from several government and NGO web sites in the form of csv files imported into a postgresql database.  The table of health scores by state was scraped from the United Health Foundations' health rankings webpage. (In the interests of loading speed, the health scores table is not scraped in real time, but was loaded into the database with the other static data downloaded in csv form.) 

We used python, sqlalchemy and flask to get the data out of the database and into web endpoints where javascript could find them for our visualizations.

### Running the Dashboard

Five files are needed to run the app:  app.py, config.py, logic.js, index.html, and style.css.  Please note that the API token used to create the leaflet map expires regularly and needs to be refreshed.  Users can either insert their own token or contact me (michal.fineman@gmail.com) to update mine.

### Variations on a Theme

One of the pleasures of the project was the opportunity to try different methods for achieving similar outputs.  For example, we employed several different techniques for reading data from the postrgresql database into python.  The comments in the app.py file point these out.

Similiarly, we used a couple of different approaches to create our visualizations: handbuilding charts and maps with d3, mapbox and leaflet and exploiting the conveniences of plotly.  

### Observations
The point of the project was not to apply rigorous statistical analysis, but to allow users to ask questions about possible correlations between poverty and health factors and get a visual sense of the relationships among them, possibly teeing up issues warranting further study.  Some interesting observations that emerge from the visualizations include the following:

![Food Availability Chart](https://github.com/mfineman/Picture_of_Health/blob/main/Code/static/Images/food_avail.png)

1.  On the face of it, the correlation between food deserts and poverty does not seem very strong, especially in the middle of the range.  Indeed, the prevalence of food deserts in some states seems to have more to do with population density than poverty.  For example, South Dakota has the most people living in food deserts but ranks 32nd for poverty.  Other more densely populated states, such as Connecticut and Massachusetts, also have large populations living in food deserts although their overall poverty rates are low.  In these cases, we might surmise that their food desert rankings are driven by a few large urban areas where poverty may indeed correlate to inaccessibility of sources of good food.

![Crime Chart](https://github.com/mfineman/Picture_of_Health/blob/main/Code/static/Images/crime.png)

2.  The line graph comparing poverty rates with violent crime rates dramatically illustrates that the two scourges often go hand in hand, with a few interesting anomolies.  Mississipi and West Virginia, which have two of the worst poverty rates in the country, have some of the lowest rates of violent crime, while the most violent state, Alaska, ranks somewhere in the middle on poverty.  It would be interesting to explore further how some states with high levels of poverty are able to keep their citizens safe while others cannot.

![College Graduation Chart](https://github.com/mfineman/Picture_of_Health/blob/main/Code/static/Images/college.png)

3.  The bar graph juxtaposing college graduation rates with poverty rates appears to support the hypothesis  that poverty is related to lack of education.  In general, the highest poverty rates (orange bars) are matched with the lowest graduation rates (blue).  However, it is not a strict one to one relationship, and it would be interesting to know why some states with high poverty rates, like North Carolina and Georgia, for example (eight and ninth, respectively), manage to have relatively high graduation rates (21st and 20th).  One hypothesis might be that, unlike the other states in the top ten for poverty, North Carolina and Georgia both host industrial sectors requiring 
large numbers of professional employees.