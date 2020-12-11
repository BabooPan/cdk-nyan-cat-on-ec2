import { AmazonLinuxCpuType, AmazonLinuxGeneration, InstanceSize, SecurityGroup, UserData, Vpc } from '@aws-cdk/aws-ec2';
import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import { Fn } from '@aws-cdk/core';

export class AwsCdkNyanCatOnEc2Stack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(
      this, 'web-vpc',
      { 
        maxAzs: 1,
        natGateways: 0,
        subnetConfiguration: [
          {
            cidrMask: 24,
            name: 'web',
            subnetType: ec2.SubnetType.PUBLIC
          }
        ]
      }
    )

    const userdata = UserData.forLinux()

    userdata.addCommands(
      `sudo yum update -y`,
      `sudo yum install httpd git -y`,
      `git clone https://github.com/BabooPan/nyan-cat`,
      `sudo mv nyan-cat /var/www/html/`,
      `sudo systemctl start httpd`
    )

    const webSG = new ec2.SecurityGroup(
      this, 'web-sg',
      {
        vpc: vpc,
        allowAllOutbound: true,
        description: 'Web Security Group'
      }
    )

    webSG.addIngressRule(
      ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'HTTP from anywhere'
    )

    const web = new ec2.Instance(
      this, 'web-server',
      {
        vpc: vpc,
        instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE4_GRAVITON, ec2.InstanceSize.MICRO),
        machineImage: new ec2.AmazonLinuxImage(
          {
            generation: AmazonLinuxGeneration.AMAZON_LINUX_2,
            cpuType: AmazonLinuxCpuType.ARM_64
          }
        ),
        userData: userdata,
        securityGroup: webSG,
      }
    )

    new cdk.CfnOutput(
      this, 'web-endpoint',
      {
        value: "http://" + web.instancePublicIp + "nyan-cat/"
      }
    )

  }
}

