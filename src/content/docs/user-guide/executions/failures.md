---
title: Trace a failure
description: Move from the failed step to its output, its tasks, and the log line that explains it.
sidebar:
  label: Trace a failure
  order: 3
---

Read a failed execution from the general to the specific. Install problems, such as a Route that never connects, stay on [Troubleshooting](/deployment-guide/troubleshooting/). This page is a run that started and then failed.

## Before you start

The execution status is **Failed**, and you have the page in [One execution](/user-guide/executions/one-run/) open.

## Steps

1. **Current Step** in the summary names the step the run failed on.
2. **Step Executions** confirms that step and shows how many attempts it made before it gave up.
3. Expand the step and read its output. That is the service's own account of what went wrong. Where the step has tasks, the task list names the one responsible.
4. **Execution Logs** gives the sequence leading up to the failure. Read the logs when the output alone does not explain it.

## What you are likely to see

| What you see | What it usually means |
| --- | --- |
| A step fails after several attempts, having run for close to its maximum polling time | The external job took longer than the step allows. Raise the max attempts or the poll interval on that step. |
| A step fails immediately on attempt 1 | A configuration or connection problem. Check the service connections on **About**, and the credentials under **Settings**. |
| A prediction step fails while the steps before it succeeded | The covariate data is in place and the prediction setup does not match. Check the setup in the Modelling App. |
| A run completes, and the same months appear every time | A step is using a fixed range instead of a rolling window. This is a [schedule setting](/user-guide/schedules/input-context/). The run did not fail. |
| A run shows Attempt 2 or 3 on a step and then completes | The step is succeeding on retry. Investigate it before it begins failing outright. |

## Check

You can name the step, the attempt count, and the message from the service or from the log.

## Next

Change the step from [Create a pipeline](/user-guide/pipelines/), or [trigger the pipeline](/user-guide/pipelines/manage/) again after the external problem is cleared. Pause a run that is still going when you need the external service to recover first. See [One execution](/user-guide/executions/one-run/).
