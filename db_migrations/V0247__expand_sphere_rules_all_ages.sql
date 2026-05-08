INSERT INTO t_p5815085_family_assistant_pro.sphere_metric_rules
    (age_group, sphere_key, metric_key, metric_label, metric_group, weight, expected_count, description)
SELECT '0-3', sphere_key, metric_key, metric_label, metric_group, weight,
       GREATEST(1, ROUND(expected_count * 0.5))::int, description
FROM t_p5815085_family_assistant_pro.sphere_metric_rules WHERE age_group = '4-6'
ON CONFLICT DO NOTHING;

INSERT INTO t_p5815085_family_assistant_pro.sphere_metric_rules
    (age_group, sphere_key, metric_key, metric_label, metric_group, weight, expected_count, description)
SELECT '7-10', sphere_key, metric_key, metric_label, metric_group, weight,
       GREATEST(1, ROUND(expected_count * 1.3))::int, description
FROM t_p5815085_family_assistant_pro.sphere_metric_rules WHERE age_group = '4-6'
ON CONFLICT DO NOTHING;

INSERT INTO t_p5815085_family_assistant_pro.sphere_metric_rules
    (age_group, sphere_key, metric_key, metric_label, metric_group, weight, expected_count, description)
SELECT '11-14', sphere_key, metric_key, metric_label, metric_group, weight,
       GREATEST(1, ROUND(expected_count * 1.5))::int, description
FROM t_p5815085_family_assistant_pro.sphere_metric_rules WHERE age_group = '4-6'
ON CONFLICT DO NOTHING;

INSERT INTO t_p5815085_family_assistant_pro.sphere_metric_rules
    (age_group, sphere_key, metric_key, metric_label, metric_group, weight, expected_count, description)
SELECT '15-17', sphere_key, metric_key, metric_label, metric_group, weight,
       GREATEST(1, ROUND(expected_count * 1.7))::int, description
FROM t_p5815085_family_assistant_pro.sphere_metric_rules WHERE age_group = '4-6'
ON CONFLICT DO NOTHING;

INSERT INTO t_p5815085_family_assistant_pro.sphere_metric_rules
    (age_group, sphere_key, metric_key, metric_label, metric_group, weight, expected_count, description)
SELECT '18+', sphere_key, metric_key, metric_label, metric_group, weight,
       GREATEST(1, ROUND(expected_count * 1.8))::int, description
FROM t_p5815085_family_assistant_pro.sphere_metric_rules WHERE age_group = '4-6'
ON CONFLICT DO NOTHING;