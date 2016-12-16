switch (1) {
    case 1:
        console.log('1.1');
    case 2:
        console.log('1.2');
        break;
    case 3:
        console.log('1.3');
    default:
        console.log('1.other')
}

switch (1) {
    case 2:
        console.log('2.2');
    default:
        console.log('2.1');
}

switch (1) {
    case 2:
        console.log('3.2');
}

switch (1) {
    case 1:
        if (u) {
            break;
        }
        console.log('4.1');
        break;
}