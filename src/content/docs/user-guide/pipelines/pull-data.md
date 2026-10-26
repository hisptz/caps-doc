---
title: Pull data from another instance
description: Pull selected data from a connected DHIS2 instance, write it here, and run analytics.
sidebar:
  label: Pull data from another instance
  order: 3
---

Use this pipeline when case data lives on another DHIS2 instance. Three steps copy the values you select onto this instance and make them available in analytics.

## Before you start

- The pipeline exists and is open on **Steps**. See [Create a pipeline](/user-guide/pipelines/).
- The source instance is connected. See [Connect a source instance](/user-guide/prepare/connections/).
- This instance has data elements to store the pulled values. See [Data elements and datasets](/user-guide/prepare/data/).

Shared fields on every step — name, retries, and retry delay — are on [Create a pipeline](/user-guide/pipelines/).

## Steps

### 1. Pull from the source instance

1. Click **Add step**.
2. Under **Basics**, name the step. The name, **Max retries**, and **Retry delay (ms)** fields are the same on every step. See [Create a pipeline](/user-guide/pipelines/).
3. Under **Handler**, select **DHIS2 Instance Pull**.

![Handler list with DHIS2 Instance Pull selected](../../../../assets/user-guide/fig-016-pulling-data-from-other-instance.png)

4. Under **Configuration**, select the source instance.
5. Select the data items to pull. You can choose data elements, program indicators, or indicators. Click **Add Item** for another item.

![Data items to pull, with Add Item](../../../../assets/user-guide/fig-017-pulling-data-from-other-instance.png)

6. Choose whether to map organisation units by ID or by code, and select the organisation unit level.
7. Select the periods and the period type.

![Period and period type for the pull](../../../../assets/user-guide/fig-018-pulling-data-from-other-instance.png)

8. Under **Advanced Options**, set how many periods and organisation units to request at a time.

![Advanced options for how many periods and organisation units to request at once](../../../../assets/user-guide/fig-019-pulling-data-from-other-instance.png)

9. Click **Add step**.

### 2. Upload to this instance

1. Click **Add step**.
2. Name the step.
3. Under **Handler**, select **DHIS2 Data Upload**.
4. Under **Configuration**, select the import strategy.

![Import strategy for the data upload](../../../../assets/user-guide/fig-020-pulling-data-from-other-instance.png)

5. Click **Add step**.

### 3. Run analytics

1. Click **Add step**.
2. Name the step.
3. Under **Handler**, select **DHIS2 Analytics Run**.
4. Under **Configuration**, set **Last years** (for example **All**) and the polling fields **Poll interval (ms)** and **Max attempts**.

![Analytics run options and polling interval](../../../../assets/user-guide/fig-021-pulling-data-from-other-instance.png)

5. Click **Add step**.

The three steps are listed in that order. Drag a row to change the order.

## Check

**Steps** shows the pull, the upload, and the analytics run, in that order. A later [trigger](/user-guide/pipelines/manage/) writes the selected values onto this instance.

## Next

[Run a prediction](/user-guide/pipelines/prediction/) once the health data and climate covariates are on this instance.
