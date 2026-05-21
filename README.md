# StellarTransfer

StellarTransfer 是基于 [stonith404/pingvin-share](https://github.com/stonith404/pingvin-share) 的分支项目。

本项目在原有自托管文件分享能力的基础上，对前端首页、上传流程、取件码展示与接收文件交互进行了定制。

## 来源与致谢

- 感谢 [Pingvin Share](https://github.com/stonith404/pingvin-share) 原项目及其贡献者提供的开源基础。
- 感谢 ChatGPT 在本项目的前端交互、页面样式和代码调整过程中提供协助。

## 协议

本项目基于 Pingvin Share 二次开发，并沿用原项目的 **BSD 2-Clause License**。

BSD 2-Clause 是宽松开源许可证，不具备 GPL 类许可证的“传染性”或强 copyleft 要求。你可以修改、分发、商业使用，也可以在私有项目中使用本项目代码。

使用、修改或分发本项目时，请遵守 BSD 2-Clause License 的基本要求：

- 保留原项目的版权声明、许可证文本和免责声明。
- 如果以二进制、镜像、部署包或产品形式分发，也应在文档或随附材料中保留上述声明。
- 本仓库中的新增修改，除非特别说明，也按 BSD 2-Clause License 发布。

原项目版权归 Pingvin Share 原作者及贡献者所有。本项目的二次开发不改变原项目代码的版权归属。

## 说明

当前仓库仍保留 Pingvin Share 的核心架构、后端能力与部分原始代码结构。后续开发应继续参考原项目代码、许可证和文档，确保修改范围、署名和再分发方式符合开源协议要求。

## Docker 部署

本仓库提供重新整理后的 Docker 配置，镜像和服务命名均使用 StellarTransfer。

```bash
docker compose up -d --build
```

默认访问地址：

```text
http://localhost:3000
```

重建并刷新本地服务：

```bash
docker compose build stellartransfer
docker compose up -d stellartransfer
```

服务启动后可用以下地址做快速验证：

```text
http://localhost:3000/upload
http://localhost:3000/api/health
```

未登录用户访问账户工作区页面时会跳转到登录页，并保留原始访问路径用于登录后返回，例如：

```text
/account/shares -> /auth/signIn?redirect=%2Faccount%2Fshares
/account/reverseShares -> /auth/signIn?redirect=%2Faccount%2FreverseShares
```

常用环境变量：

- `STELLARTRANSFER_PORT`：宿主机映射端口，默认 `3000`。
- `TRUST_PROXY`：如果容器前面还有 Nginx、Caddy、Traefik 等反向代理，设置为 `true`。
- `PUID` / `PGID`：容器内运行用户对应的宿主机用户和用户组，默认 `1000`。
- `CADDY_DISABLED`：设置为 `true` 时不启动容器内 Caddy，仅保留后端端口用于自定义部署。

数据会保存在 Docker volumes：

- `stellartransfer-data`：数据库和上传文件。
- `stellartransfer-images`：前端可替换图片资源。

如需启用 ClamAV：

```bash
docker compose -f docker-compose.yml -f docker-compose.clamav.yml up -d --build
```

停止服务：

```bash
docker compose down
```
