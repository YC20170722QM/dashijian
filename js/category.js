// ********* 统一配置************//


var baseUrl = 'http://www.itcbc.com:8080'
$.ajaxPrefilter(function (option) {
    //统一配置url
    option.url = baseUrl + option.url;
    //统一配置 hesgers
    option.headers = {
        // 必须加下面的请求头，否则会报 身份认证失败
        
        //请求完成后触发
        Authorization:localStorage.getItem('token')
    }
    //统一配置complete
    option.complete = function (xhr) {
            var res = xhr.responseJSON;
            if (res && res.status === 1 && res.message === '身份认证失败') {
                //说明白token已经过去了 
                //移除过期的token
                localStorage.removeItem('token');
                //跳转到登录页.再重新登录
                location.href = './login.html'
            }
        }
})









// ------------------- 获取分类 ------------------//
// 封装函数，获取所有的分类，并渲染到页面中
// 等后续的 删除、编辑、添加 操作之后，还要调用这个函数更新页面的数据
// - render -- 渲染
// - category -- 类别
function renderCategory () {
    // 发送ajax请求，获取数据，注意请求头(Authorization）
    $.ajax({
        url: '/my/category/list',
        success: function (res) {
            console.log(res);
            if (res.status === 0) {
                // 使用模板引擎渲染
                var str = template('tpl-list', res);
                $('tbody').html(str);
            }
        }
        
    });
}

renderCategory();



// ****************删除分类*************//
$('tbody').on('click', '.del', function () {
    var id = $(this).data('id');
    layer.confirm('你确定不要我了吗?', function (index) {
        //按照接口文档,发送ajax请求,完成删除
        $.ajax({
            url: '/my/category/delete',
        data: { id: id },
            success: function (res) {
            // console.log(res);
            //给出提示
            layer.msg(res.message)
            if (res.status === 0) {
                renderCategory();
                layer.close(index)
            }
        }
        })
    })
    
})

// *******************添加分类**************//
var addIndex;
// 1. 点击添加类别,出现弹层
$('button:contains("添加类别")').on('click', function () {
     addIndex = layer.open({
        type: 1,
        title: '添加类别',
        content: $('#tpl-add').html(),
        area: ['500px', '250px']
    });
})
var addIndex;
// 2. 表单提交,注册事件,完成添加
$('body').on('submit', '#add-form', function (e) {
    e.preventDefault();
    // 规律：如果没有图片上传，一般都不使用FormData。
    // 具体：还得看接口要求
    // ajax提交数据，完成添加
    $.ajax({
        type: 'POST',
        url: '/my/category/add',
        data: $(this).serialize(),
        success: function (res) {
            // 无论成功失败，都提示
            layer.msg(res.message);
            // 添加成功
            if (res.status === 0) {
                renderCategory();
                // 关闭弹层
                layer.close(addIndex);
            }
        }
        
        
    });
});

//***********编辑修改功能************/
var editIndex;
// 1. 点击编辑,出现弹层
$('body').on('click', 'button:contains("编辑")', function () {
    //获取事件源的三个属性值
    var shuju = $(this).data();
    // console.log(zhi); // { name: 'xx', alias: 'xx', id: 2 }
    // editIndex 表示当前的弹层；关闭弹层的时候，需要用到它
    editIndex = layer.open({
        type: 1,
        title: '编辑类别',
        content: $('#tpl-edit').html(),
        area: ['500px', '250px'],
        // 弹层弹出后的回调，不要和ajax中的success弄混了
        success: function () {
            // 数据回填(不要忘记id)
            $('#edit-form input[name=name]').val(shuju.name);
            $('#edit-form input[name=alias]').val(shuju.alias);
            $('#edit-form input[name=id]').val(shuju.id);
        }
    });
});
// 2. 显示原来填的东西,然后再修改(数据回填或叫做为表单赋值)
$('body').on('submit', '#edit-form', function (e) {
    e.preventDefault();
    var data = $(this).serialize();
    $.ajax({
        type: 'POST',
        url: '/my/category/update',
        data: data,
        success: function (res) {
            layer.msg(res.message)
            if (res.status === 0) {
                renderCategory();
                layer.close(editIndex)
            }
        }
    })
})