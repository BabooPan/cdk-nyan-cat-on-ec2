import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as AwsCdkNyanCatOnEc2 from '../src/index';

test('Empty Stack', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new AwsCdkNyanCatOnEc2.AwsCdkNyanCatOnEc2Stack(app, 'MyTestStack');
  // THEN
  expectCDK(stack).to(matchTemplate({
    Resources: {},
  }, MatchStyle.EXACT));
});
