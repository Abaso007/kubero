import { Injectable, Logger } from '@nestjs/common';
import { KubernetesService } from '../kubernetes/kubernetes.service';
import { IKubectlApp } from '../kubernetes/kubernetes.interface';
import { PipelinesService } from '../pipelines/pipelines.service';
import { AppsService } from '../apps/apps.service';

@Injectable()
export class SecurityService {
  private Logger = new Logger(SecurityService.name);

  constructor(
    private kubectl: KubernetesService,
    private pipelinesService: PipelinesService,
    private appsService: AppsService
  ) {}

  public async getScanResult(pipeline: string, phase: string, appName: string, logdetails: boolean) {
    const contextName = await this.pipelinesService.getContext(pipeline, phase);
    const namespace = pipeline+'-'+phase;

    let scanResult = {
        status: 'error',
        message: 'unknown error',
        deploymentstrategy: '',
        pipeline: pipeline,
        phase: phase,
        app: appName,
        namespace: namespace,
        logsummary: {},
        logs: {},
        logPod: ''
    }

    if (!contextName) {
        scanResult.status = 'error'
        scanResult.message = 'no context found'
        return scanResult;
    }

    const appresult = await this.appsService.getApp(pipeline, phase, appName)

    const app = appresult as IKubectlApp;

    const logPod = await this.kubectl.getLatestPodByLabel(namespace, `vulnerabilityscan=${appName}`);

    if (!logPod.name) {
        scanResult.status = 'error'
        scanResult.message = 'no vulnerability scan pod found'
        return scanResult;
    }

    let logs = '';
    if (contextName) {
        this.kubectl.setCurrentContext(contextName);
        logs = await this.kubectl.getVulnerabilityScanLogs(namespace, logPod.name);
    }

    if (!logs) {
        scanResult.status = 'running'
        scanResult.message = 'no vulnerability scan logs found'
        return scanResult;
    }

    const logsummary = this.getVulnSummary(logs);

    scanResult.status = 'ok'
    scanResult.message = 'vulnerability scan result'
    scanResult.deploymentstrategy = app?.spec?.deploymentstrategy
    scanResult.logsummary = logsummary
    scanResult.logPod = logPod


    if (logdetails) {
        scanResult.logs = logs;
    }

    return scanResult;
  }

  private getVulnSummary(logs: any) {
    let summary = {
        total: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        unknown: 0
    }

    if (!logs || !logs.Results) {
        this.Logger.error(logs);
        this.Logger.error('no logs found or not able to parse results');
        return summary;
    }

    logs.Results.forEach((target: any) => {
        if (target.Vulnerabilities) {
            target.Vulnerabilities.forEach((vuln: any) => {
                summary.total++;
                switch (vuln.Severity) {
                    case 'CRITICAL':
                        summary.critical++;
                        break;
                    case 'HIGH':
                        summary.high++;
                        break;
                    case 'MEDIUM':
                        summary.medium++;
                        break;
                    case 'LOW':
                        summary.low++;
                        break;
                    case 'UNKNOWN':
                        summary.unknown++;
                        break;
                    default:
                        summary.unknown++;
                }
            });
        }
    });

    return summary;
  }
}
