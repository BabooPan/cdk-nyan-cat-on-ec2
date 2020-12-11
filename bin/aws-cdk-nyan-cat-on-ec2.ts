#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { AwsCdkNyanCatOnEc2Stack } from '../lib/aws-cdk-nyan-cat-on-ec2-stack';

const app = new cdk.App();
new AwsCdkNyanCatOnEc2Stack(app, 'AwsCdkNyanCatOnEc2Stack');
