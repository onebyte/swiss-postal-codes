# Swiss Postal Codes Map

This repository provides an example of how to generate a map of postal codes for all Switzerland or only for one canton.
You can use it on a web site and show your quantitative data for each postal codes.

Examples
--------------------------------------
In these examples the data are the estimate population for each postal codes.

<img src="https://cloud.githubusercontent.com/assets/14947215/15290833/403088d8-1b7b-11e6-97a2-ad9a4a4208c9.png" width="460" align="top">
<img src="https://cloud.githubusercontent.com/assets/14947215/15447895/c3f8b8ba-1f50-11e6-9133-63b39db3b7a7.png" width="340" align="top">

Demo
--------------------------------------
You can see a demo on this link: https://bassim.ch/swiss_map

Options Box
--------------------------------------
The box above the map allows you to do several things.
In the left input you can enter a postal code and zoom to. There is also a button to reset the zoom.
In the right input you can change the time for zoom transition in second (2 by default).
There is also a button "play" that chooses a random postal code, zoom to, reset zoom and restart.

How the map data are generated
--------------------------------------

In the json folder, two files (cantons_suisses.json and ch_plz.json) are in topoJSON format. The first one contains the data for cantons and lakes, the second one contains the data for postal codes. They are both generated with the swiss-maps system that you can find here: https://github.com/interactivethings/swiss-maps. With this you can easily make a lot of different maps of Switzerland using your command line. The row data are taken from the Swiss Federal Office of Topography, swissBOUNDARIES3D 2015.

The third JSON file (plz_data.json) is generated with the python script agregation.py in the agregation folder. We needed this because we only found the total population for each municipality but not for every postal codes. So we aggregate two CSV files to have an estimation of the population for each postal codes. The first one (bfs_and_pop.csv) contains the municipality data with the population and the second one (plz_and_bfs.csv) contains the links between municipality and postal codes. The result is only estimation, sometimes far from the reality so be careful.

Dependences
--------------------------------------
In the head of the index.html, you can see that we use Jquery and D3.js

Javascript code
--------------------------------------
All the Javascript code is in the swiss_map.js file in js folder.
We divided our code in several parts:
- **config**: this object contains all the important things to initialise at the beginnings.
- **loader**: this object loads the map data and render it.
- **zoomer**: this object manage the zoom behaviour.
- **event**: this part is where we bind the events
- **init**: the last part is the function that initialise all the process

Load only one canton
--------------------------------------
By default if you want to load only one canton it will be the canton of Vaud. So if you want to change that and load another canton there two things to modify:
- **index.html**: On line 25, replace "Load Vaud" by what you want.
- **js/swiss_map.js**: On line 418, replace load('VD') by load('GE') if you want Geneva for exemple

Installation
--------------------------------------
To install this system on your website, you only need to copy this repository.
So if you create the folder your-web-site.com/swissMap/ place the repository on it and it will visible on this url.

Author
--------------------------------------
This project has been made by Bassim Matar during the spring semester 2016. It has been realised in the data visualisation course given by Isaac Pante at the Lausanne University.

