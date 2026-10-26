---
title: Before a pipeline
description: Gather data elements, an approved model, climate data, and source instances before you build a pipeline.
sidebar:
  label: Prepare
  order: 3
---

A prediction pipeline can only use data and setups that already exist. Create those before you add steps.

## Before you start

You can open [CAPS](/user-guide/interface/). The worker URLs for DHIS2, CHAP, and the climate service are already set. That install work is [CHAP, climate, and DHIS2](/deployment-guide/engine/connections/).

## Checklist

1. [Data elements and datasets](/user-guide/prepare/data/) for climate covariates, thresholds, and prediction results.
2. An approved [model evaluation and prediction setup](/user-guide/prepare/modelling/) in the Modelling App.
3. [Climate datasets imported](/user-guide/prepare/climate-data/) for the covariates the model uses.
4. A [connection to each source DHIS2 instance](/user-guide/prepare/connections/) when the health data lives somewhere other than this instance. Skip this when the modelling instance already holds the case data.

## Check

You can name the dataset, the approved evaluation, and the climate datasets the pipeline will use. If the pipeline will pull from another instance, that instance appears on **About**.

## Next

[Create a pipeline](/user-guide/pipelines/).
