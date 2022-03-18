import * as assertions from '@aws-cdk/assertions';
import * as cdk from '@aws-cdk/core';
import { CdkNyanCatOnEc2 } from '../src/index';

test('test create EC2 instance', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new cdk.Stack(app, 'test-stack');
  // THEN
  new CdkNyanCatOnEc2(stack, 'nyan-cat-on-ec2');
  assertions.Template.fromStack(stack).findResources('AWS::EC2::Instance');
});
