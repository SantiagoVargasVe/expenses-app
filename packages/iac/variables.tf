variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "instance_type" {
  type    = string
  default = "t4g.micro"
}

variable "key_pair_name" {
  type = string
}

variable "ssh_cidr" {
  type    = string
  default = "0.0.0.0/0"
}

variable "root_volume_gb" {
  type    = number
  default = 30
}
