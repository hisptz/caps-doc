---
title: Evaluation and prediction setup
description: Approve a model evaluation and a prediction setup in the Modelling App before CAPS can run them.
sidebar:
  label: Evaluation and prediction setup
  order: 3
---

CAPS triggers a prediction that already exists. It does not create the model.

## Before you start

The [modelling dataset](/user-guide/prepare/data/) exists, and you can open the Modelling App.

## Steps

In the Modelling App, create a model evaluation, run it, and approve it. Then create a prediction setup for that evaluation.

The steps for both live in the Modelling App, not in CAPS:

1. Open the Modelling App.
2. Open **Guides** at the bottom of the left navigation.
3. Under **User Guides**, follow the guide for model evaluations and the guide for a prediction setup.

When you later add a **Prediction Trigger** step, you select this approved evaluation. CAPS fills in the prediction setup that belongs to it. See [Run a prediction](/user-guide/pipelines/prediction/).

## Check

The evaluation you intend to run is approved, and it has a prediction setup.

## Next

[Import the climate datasets](/user-guide/prepare/climate-data/) the model uses as covariates.
