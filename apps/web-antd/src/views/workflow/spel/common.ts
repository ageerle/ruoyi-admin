export function generateSpel(data: {
  componentName?: string;
  methodName?: string;
  methodParams?: string;
}) {
  const { componentName, methodName, methodParams } = data;
  if (!componentName || !methodName) {
    return '-';
  }

  const params = methodParams ? methodParams.split(',') : [];
  const methodParamsText = params.map((item) => `#${item}`).join(',');

  return `#{@${componentName}.${methodName}(${methodParamsText})}`;
}
