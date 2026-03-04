output "public_ip" {
  value = aws_instance.app.public_ip
}

output "api_ecr_repo_url" {
  value = aws_ecr_repository.api.repository_url
}

output "web_ecr_repo_url" {
  value = aws_ecr_repository.web.repository_url
}
