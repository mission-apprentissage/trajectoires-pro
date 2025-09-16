{% for key, value in env_variables.items() %}
{% if value is string %}
{{ key }}='{{ value }}'
{% else %}
{{ key }}={{ value }}
{% endif %}
{% endfor %}