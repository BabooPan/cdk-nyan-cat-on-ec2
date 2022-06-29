# Welcome to aws-cdk-nyan-cat-on-ec2

This is a nyan-cat page stored in EC2 Instance writen in TypeScript development with CDK.

## Steps

There's 3 architecture to host the nyan-cat application:

1. `cdk-web`: On-Demand EC2 Instance.
2. `cdk-web-spot`: Spot EC2 Instance with EIP.
3. `cdk-web-alb-spot`: Spot AutoScaling Group with ALB.

You can view the available templates with `cdk ls`.

Deploy with `cdk deploy TEMPLATE_NAME`, and hold the seconds, the endpoint of website would print out.

![cdk-deploy](./images/cdk-deploy.png)

The EC2 Instance would take some times, the endpoint would show out.

![nyan-cat](./images/nyan-cat.jpg)

After that, remember to clean up this stack with `cdk destory`.

![cdk-destory](./images/cdk-destory.png)

## Reference

* web page for nyan-cat [cristurm/nyan-cat](https://github.com/cristurm/nyan-cat)
