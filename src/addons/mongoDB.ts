import {Plugin, IPlugin, IPluginFormFields} from './plugin';

// Classname must be same as the CRD's Name
export class MongoDB extends Plugin implements IPlugin {
    public id: string = 'mongodb-operator';//same as operator name
    public install: string = 'kubectl create -f https://operatorhub.io/install/mongodb-operator.yaml'
    public artifact_url = 'https://artifacthub.io/api/v1/packages/olm/community-operators/mongodb-operator'
    public beta: boolean = true;

    public formfields: {[key: string]: IPluginFormFields} = {
        'MongoDB.metadata.name':{
            type: 'text',
            label: 'MongoDB Name',
            name: 'MongoDB.metadata.name',
            required: true,
            default: 'mongodbinstance',
            description: 'The name of the MongoDB cluster'
        },
        'MongoDB.spec.storage.storageSize':{
            type: 'text',
            label: 'Sorage Size',
            name: 'MongoDB.spec.storage.storageSize',
            default: '1Gi',
            required: true,
            description: 'Size of the storage'
        },
        'MongoDB.spec.storage.storageClass':{
            type: 'text',
            label: 'Sorage Class',
            name: 'MongoDB.spec.storage.storageClass',
            default: 'standard',
            required: true,
            description: 'Classname of the storage'
        },
        'mongodbSecret.stringData.password':{
            type: 'text',
            label: 'MongoDB Password',
            name: 'mongodbSecret.stringData.password',
            default: 'changeMe',
            required: true,
            description: 'Password for MongoDB'
        },
    };

    public env: any[] = []

    //https://www.convertsimple.com/convert-yaml-to-javascript-object/
    protected additionalResourceDefinitions: Object = {
        mongodbSecret: {
            apiVersion: "v1",
            stringData: {
              // TODO - generate a random password or make it configurable
              password: "test",
            },
            kind: "Secret",
            metadata: {
              annotations: {
                'meta.helm.sh/release-name': "test",
                'meta.helm.sh/release-namespace': "kubero-dev"
              },
              labels: {
                'app.kubernetes.io/managed-by': "Kubero"
              },
              name: "mongodb-secret",
            },
            type: "Opaque"
        }
    }

    constructor(availableOperators: any) {
        super();
        super.init(availableOperators);
    }

}