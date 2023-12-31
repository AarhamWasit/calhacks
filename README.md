# Burnout Monitor

A Cal Hacks 10 submission

## Problem

The demanding nature of healthcare work often leads to burnout, impacting both the individuals themselves and the quality of patient care. Unfortunately, burnout frequently goes unnoticed until it reaches a critical stage, affecting not only the mental health of the professionals but also potentially jeopardizing patient safety and outcomes.

## Our Solution


The app not only efficiently detects emotional states but identifies early indicators of burnout among medical professionals through a custom neural network. 

It offers a user-friendly interface that presents weekly logs of burnout risk levels and a user friendly web dashboard of their associated emotional trends.

This app builds upon Hume's video emotion detection technology to predict and prevent burnout among healthcare workers. Existing approaches use frequent surveillance to profile medical practitioners' mental states, jeopardizing privacy. Our application protects privacy by recording infrequent but regular interactions with patients, with full knowledge of those involved. 

## How we built it

At the core of our project was Hume's emotion detection API's ability to recognize 52 diverse, expressive nuances in facial expressions. We used the results of `HumeBatchClient` and `HumeBatchClient`'s facial expression model to train a custom ML model to detect burnout on a carefully curated training dataset.

We collected images labeled based on levels of burnout from open health research [1](https://bmcmededuc.biomedcentral.com/articles/10.1186/s12909-023-04003-y#Sec46) [2](https://www.aapl.org/docs/pdf/VIDEO%20RECORDING%20GUIDELINE%202013.pdf), friends, Hume's sample images, and synthetic data to train a regression model in scikit-learn. The model took as inputs the 52 emotions extracted from video frames as well as their manually selected labels, and optimized to learn the relationship between these emotions and eventual burnout.

Our project wouldn't be possible without CockroachDB's serverless database and their intuitive SQL Shell, which allowed us to define and work with schemas.

We communicate with the database from the Flask backend as well as the python script used to collect video and query the Hume batch API endpoints.

## Challenges we ran into

- One of the biggest challenges was the amount of iteration our project went through before a finalized idea. We took great care to find a socially relevant, unique problem with an original solution.
- We struggled to determine the ground truth for what counts as someone showing signs of being "burnt out". We found it effective to use some synthetic data generated by dall-e 3 and manually labeled images 

## Accomplishments that we're proud of

- Successfully trained a classification model and deployed it on Hume's custom model platform using a self-labeled dataset for identifying potential burnout signs.

## What we learned

- Explored `HumeStreamClient` for WebSocket integration in Flask. We learned about nuances of WebSockets vs other HTTP connections.

## What's next for Burnout Monitor

- We want to incorporate spoken data to improve our prediction and data visualization. Conversational Emotion Recognition (CER) is a task to predict the emotion of dialogue in the context of a conversation.
- We want to improve the accuracy of our model by expanding on training data, parameters, and compute. 
- Add a centralized alert system that creates actionable suggestions based on likely burnout for workers.
