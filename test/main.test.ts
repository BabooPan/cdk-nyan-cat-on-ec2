import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { CdkNyanCatOnEc2 } from '../src/main';

test('test create EC2 instance', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new cdk.Stack(app, 'test-stack');
  // THEN
  new CdkNyanCatOnEc2(stack, 'nyan-cat-on-ec2');
  Template.fromStack(stack).findResources('AWS::EC2::Instance');
});
