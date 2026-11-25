---
title: Handlers
description: Choose the operation a pipeline step performs and the settings that operation needs.
sidebar:
  label: Handlers
  order: 2
---

A handler is the operation a step performs. You select it under **Handler**, then fill in **Configuration**. The handler decides the operation. The configuration decides the details, such as which instance, data items, organisation units, and periods.

The catalog installed with CAPS can include more handlers than this page. Adding a handler in code is [Pipeline steps](/development-guide/handlers/). This page is what each forecasting handler means when you configure a step.

## Before you start

You are adding a step on [Create a pipeline](/user-guide/pipelines/).

## DHIS2

| Handler | What the step does | What you configure |
| --- | --- | --- |
| **DHIS2 Instance Pull** | Reads selected data from a connected DHIS2 instance | Source instance, data items, organisation unit mapping, periods |
| **DHIS2 Data Upload** | Writes data into a DHIS2 instance | Import strategy |
| **DHIS2 Analytics Run** | Builds the analytics tables so later steps can query the values just written | Which years to run, and how to poll the analytics job |

A pull of routine data uses these three in order. See [Pull data from another instance](/user-guide/pipelines/pull-data/).

## Open Climate Service

| Handler | What the step does | What you configure |
| --- | --- | --- |
| **Open Climate Service Sync** | Brings imported climate datasets up to date | Which datasets, what to do if one fails, how far to sync, poll interval and attempts |
| **Open Climate Service Create** | Asks for covariate values for a period and a set of organisation units | Dataset, covariate, aggregation, period, organisation units |
| **Open Climate Service Poll** | Checks whether that request has finished | The step name. The job comes from the create step before it |
| **Open Climate Service Download** | Downloads the finished covariate in a form DHIS2 can import | The step name. The file comes from the polled job |

Create, poll, and download repeat once for each covariate, and a **DHIS2 Data Upload** step follows each download. See [Run a prediction](/user-guide/pipelines/prediction/).

## CHAP

| Handler | What the step does | What you configure |
| --- | --- | --- |
| **Prediction Trigger** | Starts a prediction from an approved evaluation | Evaluation, job name, training period, periods to forecast, organisation units |
| **Prediction Poll** | Checks whether that prediction has finished | The step name. The job comes from the trigger step |
| **Prediction Data Download** | Downloads the forecast in a form DHIS2 can import | Review the forecast outputs and where they will be written |

A **DHIS2 Data Upload** step after the download writes the forecast onto the staging instance.

## Check

Each step in the pipeline has a handler, and its configuration names a real instance, dataset, evaluation, or data element.

## Next

Build a [pull pipeline](/user-guide/pipelines/pull-data/) or a [prediction pipeline](/user-guide/pipelines/prediction/).
