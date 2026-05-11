INSERT INTO dev_agent_configs (environment) VALUES ('stage')
  ON CONFLICT (environment) DO NOTHING;
INSERT INTO dev_agent_configs (environment) VALUES ('prod')
  ON CONFLICT (environment) DO NOTHING;

INSERT INTO domovoy_feature_flags (code, description, environment, is_enabled)
VALUES ('dev_agent.enabled', 'Dev Agent Studio', 'stage', TRUE)
ON CONFLICT (code, environment) DO NOTHING;
INSERT INTO domovoy_feature_flags (code, description, environment, is_enabled)
VALUES ('dev_agent.enabled', 'Dev Agent Studio', 'prod', TRUE)
ON CONFLICT (code, environment) DO NOTHING;
INSERT INTO domovoy_feature_flags (code, description, environment, is_enabled)
VALUES ('dev_agent.patch_generation_enabled', 'Patch generation flag', 'stage', FALSE)
ON CONFLICT (code, environment) DO NOTHING;
INSERT INTO domovoy_feature_flags (code, description, environment, is_enabled)
VALUES ('dev_agent.patch_generation_enabled', 'Patch generation flag', 'prod', FALSE)
ON CONFLICT (code, environment) DO NOTHING;
INSERT INTO domovoy_feature_flags (code, description, environment, is_enabled)
VALUES ('dev_agent.full_trace_enabled', 'Full trace in S3', 'stage', TRUE)
ON CONFLICT (code, environment) DO NOTHING;
INSERT INTO domovoy_feature_flags (code, description, environment, is_enabled)
VALUES ('dev_agent.full_trace_enabled', 'Full trace in S3', 'prod', FALSE)
ON CONFLICT (code, environment) DO NOTHING;
