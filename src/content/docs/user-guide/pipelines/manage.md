---
title: Trigger, edit, or delete
description: Start a pipeline with its saved settings or with overrides, and change or remove it.
sidebar:
  label: Trigger, edit, or delete
  order: 5
---

After the steps are saved, you start a run from the pipeline list or from the pipeline itself. Editing and deleting are on the same screens.

## Before you start

The pipeline has the steps it needs. See [Create a pipeline](/user-guide/pipelines/).

## Trigger

Triggering starts one execution.

**From the pipeline list.** Open **Pipelines**, find the row, and click **Trigger** in **Actions**.

![Trigger in the pipeline list Actions column](../../../../assets/user-guide/fig-046-triggering-a-pipeline.png)

**From the pipeline.** Open the pipeline and click **Trigger** at the top right. The menu beside that button has two choices:

![Trigger menu with Trigger and Trigger with context](../../../../assets/user-guide/fig-047-triggering-a-pipeline.png)

- **Trigger** uses the period and organisation unit settings saved on the steps.
- **Trigger with context...** opens a dialog that lists those settings. Change the period or organisation units for this run, or leave them. Click **Trigger** to start. This run uses the values in the dialog. The steps keep the settings they already had.

![Trigger with context dialog listing period and organisation unit settings](../../../../assets/user-guide/fig-048-triggering-a-pipeline.png)

A scheduled run can apply its own overrides. That is [Input context](/user-guide/schedules/input-context/).

## Edit

**Pipeline details.** From **Pipelines**, click **Edit** on the row. Change the fields and click **Save Changes**. Or open the pipeline, click **Edit** at the top right, and save.

![Edit in the pipeline list Actions column](../../../../assets/user-guide/fig-049-editing-a-pipeline.png)

**One step.** On **Steps**, click **Edit** on the row, change the step, and save it.

## Delete

**The pipeline.** From **Pipelines**, click **Delete** on the row, or open the pipeline and click **Delete** at the top right. The confirmation explains what is removed. Click **Delete** to remove the pipeline, or **Cancel** to keep it.

![Delete in the pipeline list Actions column](../../../../assets/user-guide/fig-050-deleting-a-pipeline.png)

![Delete confirmation for the open pipeline](../../../../assets/user-guide/fig-051-deleting-a-pipeline.png)

**One step.** On **Steps**, click **Delete** on the row. Confirm with **Delete**, or click **Cancel** to keep the step.

## Check

A triggered pipeline appears under [Executions](/user-guide/executions/) with status Pending or Running. An edit is visible when you reopen the pipeline. A deleted pipeline is gone from the list.

## Next

[Read the execution](/user-guide/executions/) to see which step the run has reached.
