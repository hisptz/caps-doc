---
title: User Guide
description: Use CAPS day to day to prepare data, run a pipeline, and read the result.
sidebar:
  label: Start here
  order: 1
---

This guide is for a modeller who runs climate-informed disease forecasts in DHIS2 after CAPS is installed. Installing the engine and the app is the [Deployment Guide](/deployment-guide/). Changing a handler or the app is the [Development Guide](/development-guide/).

A forecast needs a fixed order of operations: case data present and current in DHIS2, climate data obtained, a prediction run, and the forecast written back. The forecast then appears as the case numbers expected in the months ahead. That ordered set of operations is a workflow. CAPS holds the workflow as a **pipeline**: a named, reusable sequence of steps. Each step performs one operation through a handler. CAPS runs the steps in order, on demand or on a schedule.

CAPS coordinates three services:

- **DHIS2**, which holds the routine health data and receives the climate covariates and forecast results.
- **The Open Climate Service**, which provides climate datasets and aggregates them onto organisation units for a period.
- **The Climate Health Analytics Platform (CHAP)**, which runs the prediction models.

CAPS is installed into a DHIS2 instance and uses that instance's interface. It reads setups already configured in the services it connects to. It does not build models or define predictions.

## How a run works

You create a pipeline as an ordered list of steps and assign each step a handler. When you trigger the pipeline, or when a schedule fires, CAPS places each step on its queue and runs the steps in order, passing the output of one step forward.

Many steps hand work to a service that does not finish immediately. For those, a later step polls the existing job at a configured interval until it completes or the configured limits are reached. Polling checks a job that is already running. Retry runs a failed step again. Each step has its own maximum retries and retry delay.

Every run is an execution with its own status, a step-by-step record, and logs.

## What you can run

- Import climate datasets from the Open Climate Service and keep them current as new periods become available.
- Pull routine data from other DHIS2 instances into the instance used for modelling.
- Trigger a prediction against an approved CHAP evaluation and write the forecast back to DHIS2.
- Run a complete forecasting workflow on a monthly or weekly cycle.

## Next

1. [Open CAPS](/user-guide/interface/).
2. [Prepare the data](/user-guide/prepare/).
3. [Create a pipeline](/user-guide/pipelines/), then [schedule it](/user-guide/schedules/) or [read a run](/user-guide/executions/).
