import * as cdk from 'aws-cdk-lib';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as spotone from 'cdk-spot-one';
import { Construct } from 'constructs';

export class CdkNyanCatOnAsgWithAlb extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'web-vpc', {
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'web',
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });

    const userData = ec2.UserData.forLinux();

    userData.addCommands(
      'sudo yum update -y',
      'sudo yum install httpd git -y',
      'git clone https://github.com/BabooPan/nyan-cat',
      'sudo mv nyan-cat /var/www/html/',
      'sudo systemctl start httpd',
    );

    const webSG = new ec2.SecurityGroup(this, 'web-sg', {
      vpc: vpc,
      allowAllOutbound: true,
      description: 'Web Security Group',
    });

    // webSG.addIngressRule(
    //   ec2.Peer.anyIpv4(),
    //   ec2.Port.tcp(80),
    //   'HTTP from anywhere',
    // );
    // webSG.addIngressRule(
    //   ec2.Peer.securityGroupId(webSG.securityGroupId),
    //   ec2.Port.allTraffic(),
    //   'Allow self visisted',
    // );

    const asgLaunchTemplateArm = new ec2.LaunchTemplate(
      this,
      'ASGLaunchTemplateArm',
      {
        machineImage: new ec2.AmazonLinuxImage({
          generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
          cpuType: ec2.AmazonLinuxCpuType.ARM_64,
        }),
        securityGroup: webSG,
        userData,
      },
    );

    const autoScalingGroupArm = new autoscaling.AutoScalingGroup(
      this,
      'ASG-arm',
      {
        vpc,
        mixedInstancesPolicy: {
          launchTemplate: asgLaunchTemplateArm,
          instancesDistribution: {
            onDemandPercentageAboveBaseCapacity: 0,
          },
          launchTemplateOverrides: [
            { instanceType: new ec2.InstanceType('t4g.micro') },
            { instanceType: new ec2.InstanceType('t4g.small') },
            { instanceType: new ec2.InstanceType('t4g.medium') },
            { instanceType: new ec2.InstanceType('m6g.large') },
          ],
        },
        minCapacity: 1,
        maxCapacity: 1,
        vpcSubnets: {
          subnetType: ec2.SubnetType.PUBLIC,
        },
      },
    );

    const alb = new elbv2.ApplicationLoadBalancer(this, 'alb', {
      vpc,
      internetFacing: true,
    });
    const listener = alb.addListener('listener', {
      port: 80,
    });
    listener.addTargets('targetAsg', {
      port: 80,
      targets: [autoScalingGroupArm],
    });

    new cdk.CfnOutput(this, 'web-endpoint', {
      value: 'http://' + alb.loadBalancerDnsName + '/nyan-cat/',
    });
  }
}

export class CdkNyanCatOnEc2Spot extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'web-vpc', {
      maxAzs: 1,
      natGateways: 0,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'web',
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });

    const userData = [
      'sudo yum update -y',
      'sudo yum install httpd git -y',
      'git clone https://github.com/BabooPan/nyan-cat',
      'sudo mv nyan-cat /var/www/html/',
      'sudo systemctl start httpd',
    ];

    const webSG = new ec2.SecurityGroup(this, 'web-sg', {
      vpc: vpc,
      allowAllOutbound: true,
      description: 'Web Security Group',
    });

    webSG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'HTTP from anywhere to visit',
    );

    const elasticIp = new ec2.CfnEIP(this, 'EIP', {
      domain: 'vpc',
    });

    const web = new spotone.SpotInstance(this, 'web', {
      vpc,
      defaultInstanceType: ec2.InstanceType.of(
        ec2.InstanceClass.BURSTABLE4_GRAVITON,
        ec2.InstanceSize.MICRO,
      ),
      customAmiId: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
        cpuType: ec2.AmazonLinuxCpuType.ARM_64,
      }).getImage(this).imageId,
      additionalUserData: userData,
      securityGroup: webSG,
    });

    new ec2.CfnEIPAssociation(this, 'EIPAssociation', {
      allocationId: elasticIp.attrAllocationId,
      instanceId: web.instanceId,
    });

    new cdk.CfnOutput(this, 'web-endpoint', {
      value: 'http://' + elasticIp.ref + '/nyan-cat/',
    });
  }
}

export class CdkNyanCatOnEc2 extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'web-vpc', {
      maxAzs: 1,
      natGateways: 0,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'web',
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });

    const userData = ec2.UserData.forLinux();

    userData.addCommands(
      'sudo yum update -y',
      'sudo yum install httpd git -y',
      'git clone https://github.com/BabooPan/nyan-cat',
      'sudo mv nyan-cat /var/www/html/',
      'sudo systemctl start httpd',
    );

    const webSG = new ec2.SecurityGroup(this, 'web-sg', {
      vpc: vpc,
      allowAllOutbound: true,
      description: 'Web Security Group',
    });

    webSG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'HTTP from anywhere',
    );

    const web = new ec2.Instance(this, 'web-server', {
      vpc: vpc,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.BURSTABLE4_GRAVITON,
        ec2.InstanceSize.MICRO,
      ),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
        cpuType: ec2.AmazonLinuxCpuType.ARM_64,
      }),
      userData,
      securityGroup: webSG,
    });

    new cdk.CfnOutput(this, 'web-endpoint', {
      value: 'http://' + web.instancePublicIp + '/nyan-cat/',
    });
  }
}

// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new cdk.App();

new CdkNyanCatOnEc2(app, 'cdk-web', { env: devEnv });
new CdkNyanCatOnEc2Spot(app, 'cdk-web-spot', { env: devEnv });
new CdkNyanCatOnAsgWithAlb(app, 'cdk-web-alb-spot', { env: devEnv });

app.synth();
