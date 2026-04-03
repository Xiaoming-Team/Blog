{%- if theme.wechat_subscribe.enable %}

<p>{{ theme.wechat_subscribe.description }}</p>
<p style="text-align: center;">
<img src="{{ url_for(theme.wechat_subscribe.qrcode) }}" alt="{{ theme.wechat_subscribe.qrcode_alt }}">
</p>

{%- endif %}
