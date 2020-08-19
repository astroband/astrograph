{{/* vim: set filetype=mustache: */}}
{{/*
Expand the name of the chart.
*/}}
{{- define "astrograph.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "astrograph.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "astrograph.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Common labels
*/}}
{{- define "astrograph.labels" -}}
app.kubernetes.io/name: {{ include "astrograph.name" . }}
helm.sh/chart: {{ include "astrograph.chart" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{- define "astrograph.env" -}}
{{- with .Values.database.fromSecret }}
- name: DATABASE_URL
  valueFrom:
    secretKeyRef:
      name: {{ required "name of database.fromSecret is required" .name | quote }}
      key: {{ required "key of database.fromSecret is required" .key | quote }}
{{- else }}
- name: DATABASE_URL
  value: {{ .Values.database.url | quote }}
{{- end }}

{{- with .Values.es.fromSecret }}
- name: ELASTIC_URL
  valueFrom:
    secretKeyRef:
      name: {{ required "name of es.fromSecret is required" .name | quote }}
      key: {{ required "key of es.fromSecret is required" .key | quote }}
{{- else }}
- name: ELASTIC_URL
  value: {{ .Values.es.url | quote }}
{{- end }}
- name: STELLAR_HTTP_ENDPOINT
  value: {{ .Values.stellarHttpEndpoint | quote }}
- name: STELLAR_NETWORK
  value: {{ .Values.network | quote }}
{{- end }}
