# IaC (Terraform)

This package provisions the AWS infrastructure for the Option A deployment
(single EC2 instance + ECR repos) in `us-east-1`.

## Prereqs

- Terraform >= 1.6
- AWS credentials with permissions to create EC2, IAM, ECR, and Security Groups

## Usage

```sh
cd packages/iac
terraform init
terraform apply \
  -var "aws_region=us-east-1" \
  -var "key_pair_name=your-keypair-name"
```

## Outputs

- `public_ip`: EC2 public IP for SSH + HTTP access
- `api_ecr_repo_url`: ECR repository for API image
- `web_ecr_repo_url`: ECR repository for web image

## Variables

- `aws_region` (default: `us-east-1`)
- `instance_type` (default: `t4g.micro`)
- `key_pair_name` (required): EC2 key pair to allow SSH
- `ssh_cidr` (default: `0.0.0.0/0`): who can SSH to the instance
- `root_volume_gb` (default: `30`)

## Notes

- Security group exposes ports `80` and `22` by default.
- Docker + docker compose are installed via `user_data`.
